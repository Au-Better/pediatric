// The clinician finance section's bills and loans tracker.
//
// Visitors list their loans, credit cards, rent or mortgage and other bills, see what's due
// next, mark payments made, and see roughly how long each debt will take to pay off.
// Everything stays in the visitor's own browser (see STORAGE_KEY in data/finance/tracker.ts);
// nothing is sent anywhere. Backups, a spreadsheet and a calendar file are made in the browser too.

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BILL_KIND_LABEL,
  DEBT_KINDS,
  EMPTY,
  SAMPLE,
  clearTracker,
  currentDue,
  describeMonths,
  loadTracker,
  monthlyCost,
  monthlyInterest,
  newId,
  payoff,
  sanitize,
  saveTracker,
  toCsv,
  toIcs,
  toIso,
  type Bill,
  type BillKind,
  type DueItem,
  type Frequency,
  type TrackerData,
} from "../../data/finance/tracker";
import {
  Button,
  EducationalNote,
  Warning,
  focusRing,
  formatDay,
  inputClass,
  money,
  moneyCents,
  panel,
  parseMoney,
} from "./ui";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Editing = { mode: "new" } | { mode: "edit"; id: string } | null;

export default function BillTracker() {
  const [data, setData] = useState<TrackerData>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const saved = loadTracker();
    if (saved === null) setStorageOk(false);
    else setData(saved);
    setLoaded(true);
    setToday(new Date());
  }, []);

  function update(next: TrackerData, message = "") {
    setData(next);
    const ok = saveTracker(next);
    setStorageOk(ok);
    setNotice(message);
  }

  const upcoming = useMemo(
    () =>
      data.bills
        .map((b) => currentDue(b, today))
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [data, today],
  );

  const totals = useMemo(() => {
    const debts = data.bills.filter((b) => DEBT_KINDS.includes(b.kind));
    const soon = upcoming.filter((d) => d.status !== "paid" && d.days <= 7);
    return {
      monthly: data.bills.reduce((s, b) => s + monthlyCost(b), 0),
      owed: debts.reduce((s, b) => s + (b.balance ?? 0), 0),
      interest: debts.reduce((s, b) => s + monthlyInterest(b), 0),
      soonCount: soon.length,
      soonAmount: soon.reduce((s, d) => s + d.bill.payment, 0),
    };
  }, [data, upcoming]);

  const editingBill =
    editing?.mode === "edit"
      ? data.bills.find((b) => b.id === editing.id)
      : undefined;

  function saveBill(bill: Bill) {
    const exists = data.bills.some((b) => b.id === bill.id);
    const bills = exists
      ? data.bills.map((b) => (b.id === bill.id ? bill : b))
      : [...data.bills, bill];
    update(
      { ...data, bills },
      exists ? `Saved changes to ${bill.name}.` : `Added ${bill.name}.`,
    );
    setEditing(null);
  }

  function deleteBill(id: string) {
    const bill = data.bills.find((b) => b.id === id);
    update(
      { ...data, bills: data.bills.filter((b) => b.id !== id) },
      bill ? `Deleted ${bill.name}.` : "",
    );
    setEditing(null);
  }

  function markPaid(
    item: DueItem,
    amount: number,
    paidOn: string,
    newBalance: number | null,
  ) {
    const bills = data.bills.map((b) =>
      b.id === item.bill.id
        ? {
            ...b,
            balance: newBalance ?? b.balance,
            payments: [
              ...b.payments,
              { id: newId(), covers: item.iso, paidOn, amount },
            ].slice(-36),
          }
        : b,
    );
    update(
      { ...data, bills },
      `Marked ${item.bill.name} paid for ${formatDay(item.iso)}.`,
    );
    setPayingId(null);
  }

  function undoPayment(billId: string, paymentId: string) {
    const bills = data.bills.map((b) =>
      b.id === billId
        ? { ...b, payments: b.payments.filter((p) => p.id !== paymentId) }
        : b,
    );
    update({ ...data, bills }, "Removed that payment.");
  }

  function loadSample() {
    const added = toIso(today);
    update(
      {
        version: 1,
        bills: SAMPLE.bills.map((b) => ({ ...b, id: newId(), addedOn: added })),
      },
      "Loaded the example bills. Edit or delete them, or clear everything below.",
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-6 ${panel}`}>
        <EducationalNote />
        <PrivacyNote storageOk={storageOk} />

        <p aria-live="polite" className="sr-only">
          {notice}
        </p>

        {loaded && data.bills.length > 0 && (
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Tile
              label="Bills each month"
              value={money(totals.monthly)}
              note="Yearly bills spread over 12 months"
            />
            <Tile
              label="Total owed"
              value={money(totals.owed)}
              note="Loans and cards you entered"
            />
            <Tile
              label="Interest a month"
              value={money(totals.interest)}
              note="About, at today’s balances"
            />
            <Tile
              label="Due in 7 days"
              value={money(totals.soonAmount)}
              note={`${totals.soonCount} bill${totals.soonCount === 1 ? "" : "s"} not marked paid`}
            />
          </dl>
        )}

        {loaded && data.bills.length > 0 && (
          <section aria-labelledby="bills-upcoming" className="grid gap-3">
            <h2
              id="bills-upcoming"
              className="font-display text-2xl font-semibold"
            >
              Coming up
            </h2>
            <ul className="grid gap-2.5">
              {upcoming.map((item) => (
                <li
                  key={item.bill.id}
                  className="rounded-[20px] border-[1.5px] border-line bg-white"
                >
                  <DueRow
                    item={item}
                    open={payingId === item.bill.id}
                    onOpen={() =>
                      setPayingId(
                        payingId === item.bill.id ? null : item.bill.id,
                      )
                    }
                    onPaid={markPaid}
                    onCancel={() => setPayingId(null)}
                    today={today}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {loaded && data.bills.length === 0 && editing === null && (
          <div className="grid gap-4 rounded-[22px] bg-cream px-5.5 py-6">
            <h2 className="font-display text-2xl font-semibold">
              Start with your first bill
            </h2>
            <p className="text-ink/80">
              Add a loan, a credit card, your rent or mortgage, or any bill with
              a due date. You’ll see what’s due next and how long each debt will
              take to pay off.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => setEditing({ mode: "new" })}>
                Add a bill
              </Button>
              <Button kind="secondary" onClick={loadSample}>
                Try it with example bills
              </Button>
            </div>
          </div>
        )}

        {editing && (
          <BillForm
            key={editing.mode === "edit" ? editing.id : "new"}
            bill={editingBill}
            today={today}
            onSave={saveBill}
            onCancel={() => setEditing(null)}
            onDelete={
              editingBill ? () => deleteBill(editingBill.id) : undefined
            }
          />
        )}

        {loaded && data.bills.length > 0 && (
          <section aria-labelledby="bills-all" className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="bills-all"
                className="font-display text-2xl font-semibold"
              >
                Your bills and loans
              </h2>
              {editing === null && (
                <Button onClick={() => setEditing({ mode: "new" })}>
                  Add a bill
                </Button>
              )}
            </div>
            <ul className="grid gap-2.5">
              {data.bills.map((bill) => (
                <li key={bill.id}>
                  <BillCard
                    bill={bill}
                    onEdit={() => setEditing({ mode: "edit", id: bill.id })}
                    onUndo={(paymentId) => undoPayment(bill.id, paymentId)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {loaded && (
          <Backups
            data={data}
            today={today}
            onRestore={(next) =>
              update(
                next,
                `Restored ${next.bills.length} bills from your backup.`,
              )
            }
            onCleared={() => {
              clearTracker();
              setData(EMPTY);
              setEditing(null);
              setNotice("Cleared everything from this browser.");
            }}
          />
        )}
      </div>
    </div>
  );
}

function PrivacyNote({ storageOk }: { storageOk: boolean }) {
  return (
    <div className="grid gap-1.5 rounded-2xl bg-cream-light px-4 py-3.5 leading-snug">
      <p className="font-extrabold">Your entries stay in this browser.</p>
      <p className="text-ink/80">
        They’re saved on this device only and never sent to Au Better or anyone
        else. You don’t need account numbers or passwords here, so please don’t
        enter them. Clearing your browser data erases your bills, so download a
        backup now and then.
      </p>
      {!storageOk && (
        <p className="font-bold text-brand-red-dark">
          This browser isn’t letting the page save, perhaps because of a private
          window or your settings. Your bills will be gone when you leave, so
          download a backup before you go.
        </p>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="grid content-start gap-0.5 rounded-[18px] bg-cream-light px-3.5 py-3">
      <dt className="text-xs font-extrabold tracking-wide text-ink/80 uppercase">
        {label}
      </dt>
      <dd className="font-display text-2xl font-semibold tabular-nums">
        {value}
      </dd>
      <dd className="text-sm leading-snug text-ink/80">{note}</dd>
    </div>
  );
}

function whenLabel(item: DueItem): string {
  if (item.status === "paid") return "All marked paid";
  if (item.days < 0)
    return `${-item.days} day${item.days === -1 ? "" : "s"} ago, not marked paid`;
  if (item.days === 0) return "Due today";
  if (item.days === 1) return "Due tomorrow";
  return `Due in ${item.days} days`;
}

function DueRow({
  item,
  open,
  onOpen,
  onPaid,
  onCancel,
  today,
}: {
  item: DueItem;
  open: boolean;
  onOpen: () => void;
  onPaid: (
    item: DueItem,
    amount: number,
    paidOn: string,
    newBalance: number | null,
  ) => void;
  onCancel: () => void;
  today: Date;
}) {
  const id = useId();
  const [amount, setAmount] = useState(String(item.bill.payment));
  const [paidOn, setPaidOn] = useState(toIso(today));
  const [balance, setBalance] = useState("");
  const isDebt = DEBT_KINDS.includes(item.bill.kind);
  const urgent =
    item.status === "unpaid" || (item.status === "due" && item.days <= 3);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const a = parseMoney(amount);
    const nb = balance.trim() ? parseMoney(balance) : null;
    if (!(a >= 0) || (nb !== null && !(nb >= 0))) return;
    onPaid(item, a, paidOn || toIso(today), nb);
  }

  return (
    <div className="grid gap-3 px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="grid min-w-0 flex-1 gap-0.5">
          <span className="font-display text-xl leading-tight font-semibold">
            {item.bill.name}
          </span>
          <span className="text-[0.95rem] text-ink/80">
            {formatDay(item.iso)} ·{" "}
            <span
              className={
                urgent ? "font-extrabold text-brand-red-dark" : "font-semibold"
              }
            >
              {whenLabel(item)}
            </span>
            {item.bill.autopay && (
              <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-sm font-bold">
                Autopay
              </span>
            )}
          </span>
        </div>
        <span className="font-display text-xl font-semibold tabular-nums">
          {moneyCents(item.bill.payment)}
        </span>
        {item.status !== "paid" && (
          <Button kind="secondary" onClick={onOpen} className="text-base">
            {open ? "Close" : "Mark paid"}
          </Button>
        )}
      </div>
      {open && (
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-2xl bg-cream-light p-3.5 sm:grid-cols-3"
          aria-label={`Mark ${item.bill.name} paid`}
        >
          <Field label="Amount paid" htmlFor={`${id}-amount`}>
            <input
              id={`${id}-amount`}
              className={inputClass}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Paid on" htmlFor={`${id}-date`}>
            <input
              id={`${id}-date`}
              type="date"
              className={inputClass}
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </Field>
          {isDebt && (
            <Field label="New balance (optional)" htmlFor={`${id}-balance`}>
              <input
                id={`${id}-balance`}
                className={inputClass}
                inputMode="decimal"
                placeholder={
                  item.bill.balance !== null ? String(item.bill.balance) : ""
                }
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </Field>
          )}
          <div className="flex flex-wrap gap-2 sm:col-span-3">
            <Button type="submit">Save payment</Button>
            <Button kind="quiet" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function BillCard({
  bill,
  onEdit,
  onUndo,
}: {
  bill: Bill;
  onEdit: () => void;
  onUndo: (paymentId: string) => void;
}) {
  const p = payoff(bill);
  const isDebt = DEBT_KINDS.includes(bill.kind);
  const recent = [...bill.payments]
    .sort((a, b) => (a.covers < b.covers ? 1 : -1))
    .slice(0, 3);
  const due =
    bill.frequency === "yearly"
      ? `Due each year on ${MONTHS[bill.dueMonth - 1]} ${bill.dueDay}`
      : `Due on day ${bill.dueDay} of each month`;

  return (
    <article className="grid gap-2.5 rounded-[20px] bg-cream-light px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h3 className="font-display text-xl leading-tight font-semibold">
            {bill.name}
          </h3>
          <p className="text-[0.95rem] text-ink/80">
            {BILL_KIND_LABEL[bill.kind]} · {moneyCents(bill.payment)}{" "}
            {bill.frequency === "yearly" ? "a year" : "a month"} · {due}
            {bill.autopay ? " · Autopay" : ""}
          </p>
        </div>
        <Button kind="secondary" onClick={onEdit} className="text-base">
          Edit
        </Button>
      </div>

      {isDebt && bill.balance !== null && (
        <p className="leading-snug">
          <strong className="tabular-nums">{moneyCents(bill.balance)}</strong>{" "}
          owed
          {bill.apr !== null && <> at {bill.apr}% APR</>}
          {p.kind === "months" && (
            <>
              . At this payment, paid off in about{" "}
              <strong>{describeMonths(p.months)}</strong>
              {p.interest > 0 && (
                <>, with about {money(p.interest)} in interest</>
              )}
              .
            </>
          )}
          {p.kind === "never" && (
            <>
              .{" "}
              <strong className="text-brand-red-dark">
                This payment doesn’t cover the monthly interest
              </strong>
              , so the balance will grow. That can be expected on some
              income-driven student loan plans; ask your servicer how interest
              works on yours.
            </>
          )}
          {p.kind === "none" && "."}
        </p>
      )}
      {bill.kind === "creditCard" && (
        <p className="text-sm text-ink/80">
          Payoff time assumes no new charges. Paying the full statement balance
          each month avoids interest on most cards.
        </p>
      )}

      {recent.length > 0 && (
        <details className="group">
          <summary
            className={`inline-flex min-h-10 cursor-pointer list-none items-center rounded-[10px] px-2 text-[0.95rem] font-bold text-ink/80 hover:bg-white [&::-webkit-details-marker]:hidden ${focusRing}`}
          >
            Payments marked paid ({bill.payments.length})
          </summary>
          <ul className="grid gap-1.5 pt-1.5">
            {recent.map((pay) => (
              <li
                key={pay.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[0.95rem]"
              >
                <span>
                  {moneyCents(pay.amount)} for {formatDay(pay.covers)}, paid{" "}
                  {formatDay(pay.paidOn)}
                </span>
                <button
                  type="button"
                  onClick={() => onUndo(pay.id)}
                  className={`min-h-9 rounded-[10px] px-2 font-bold text-brand-red-dark hover:bg-cream-light ${focusRing}`}
                >
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.95rem] font-extrabold">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm leading-snug text-ink/80">{hint}</p>}
    </div>
  );
}

function BillForm({
  bill,
  today,
  onSave,
  onCancel,
  onDelete,
}: {
  bill?: Bill;
  today: Date;
  onSave: (bill: Bill) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(bill?.name ?? "");
  const [kind, setKind] = useState<BillKind>(bill?.kind ?? "creditCard");
  const [payment, setPayment] = useState(bill ? String(bill.payment) : "");
  const [frequency, setFrequency] = useState<Frequency>(
    bill?.frequency ?? "monthly",
  );
  const [dueDay, setDueDay] = useState(bill ? String(bill.dueDay) : "");
  const [dueMonth, setDueMonth] = useState(
    bill?.dueMonth ?? today.getMonth() + 1,
  );
  const [balance, setBalance] = useState(
    bill?.balance != null ? String(bill.balance) : "",
  );
  const [apr, setApr] = useState(bill?.apr != null ? String(bill.apr) : "");
  const [autopay, setAutopay] = useState(bill?.autopay ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const isDebt = DEBT_KINDS.includes(kind);

  useEffect(() => nameRef.current?.focus(), []);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const problems: string[] = [];
    const pay = parseMoney(payment);
    const day = Number(dueDay);
    const bal = balance.trim() ? parseMoney(balance) : null;
    const rate = apr.trim() ? Number(apr.replace("%", "")) : null;
    if (!name.trim())
      problems.push("Give the bill a name, like “Rent” or “Student loans”.");
    if (!(pay >= 0)) problems.push("Enter the amount due, like 250 or 1,350.");
    if (!Number.isInteger(day) || day < 1 || day > 31)
      problems.push("Enter the due day as a number from 1 to 31.");
    if (isDebt && bal !== null && !(bal >= 0))
      problems.push("Enter the balance as a number, or leave it empty.");
    if (isDebt && rate !== null && !(rate >= 0 && rate < 100))
      problems.push("Enter the APR as a percentage, like 6.5.");
    setErrors(problems);
    if (problems.length) return;
    onSave({
      id: bill?.id ?? newId(),
      name: name.trim().slice(0, 80),
      kind,
      payment: pay,
      frequency,
      dueDay: day,
      dueMonth,
      balance: isDebt ? bal : null,
      apr: isDebt ? rate : null,
      autopay,
      payments: bill?.payments ?? [],
      addedOn: bill?.addedOn ?? toIso(today),
    });
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-[22px] border-[1.5px] border-ink/15 bg-white p-4 sm:p-5"
      noValidate
    >
      <h2 className="font-display text-2xl font-semibold">
        {bill ? `Edit ${bill.name}` : "Add a bill"}
      </h2>
      {errors.length > 0 && (
        <Warning>
          <ul className="grid list-disc gap-1 pl-4">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Warning>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`${id}-name`}>
          <input
            ref={nameRef}
            id={`${id}-name`}
            className={inputClass}
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rent, Sapphire card, car loan…"
            autoComplete="off"
          />
        </Field>
        <Field label="Type" htmlFor={`${id}-kind`}>
          <select
            id={`${id}-kind`}
            className={inputClass}
            value={kind}
            onChange={(e) => setKind(e.target.value as BillKind)}
          >
            {(Object.keys(BILL_KIND_LABEL) as BillKind[]).map((k) => (
              <option key={k} value={k}>
                {BILL_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={
            kind === "creditCard" ? "Minimum or planned payment" : "Amount due"
          }
          htmlFor={`${id}-payment`}
          hint={
            kind === "creditCard"
              ? "The amount you plan to pay each month."
              : undefined
          }
        >
          <input
            id={`${id}-payment`}
            className={inputClass}
            inputMode="decimal"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="How often" htmlFor={`${id}-frequency`}>
          <select
            id={`${id}-frequency`}
            className={inputClass}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value="monthly">Every month</option>
            <option value="yearly">Once a year</option>
          </select>
        </Field>
        {frequency === "yearly" && (
          <Field label="Month due" htmlFor={`${id}-month`}>
            <select
              id={`${id}-month`}
              className={inputClass}
              value={dueMonth}
              onChange={(e) => setDueMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field
          label="Day due"
          htmlFor={`${id}-day`}
          hint="1 to 31. In shorter months, the last day is used."
        >
          <input
            id={`${id}-day`}
            className={inputClass}
            inputMode="numeric"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="15"
          />
        </Field>
        {isDebt && (
          <>
            <Field label="Balance owed (optional)" htmlFor={`${id}-balance`}>
              <input
                id={`${id}-balance`}
                className={inputClass}
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field
              label="Interest rate, APR % (optional)"
              htmlFor={`${id}-apr`}
            >
              <input
                id={`${id}-apr`}
                className={inputClass}
                inputMode="decimal"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                placeholder="6.5"
              />
            </Field>
          </>
        )}
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
        <input
          type="checkbox"
          checked={autopay}
          onChange={(e) => setAutopay(e.target.checked)}
          className={`size-5 accent-brand-red ${focusRing}`}
        />
        This bill is on autopay
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">{bill ? "Save changes" : "Add bill"}</Button>
        <Button kind="quiet" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete && (
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="font-semibold">
                  Delete this bill and its payments?
                </span>
                <Button kind="primary" onClick={onDelete}>
                  Delete
                </Button>
                <Button kind="quiet" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </>
            ) : (
              <Button
                kind="quiet"
                onClick={() => setConfirmDelete(true)}
                className="text-brand-red-dark"
              >
                Delete bill
              </Button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}

function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Backups({
  data,
  today,
  onRestore,
  onCleared,
}: {
  data: TrackerData;
  today: Date;
  onRestore: (data: TrackerData) => void;
  onCleared: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [problem, setProblem] = useState("");
  const stamp = toIso(today);
  const has = data.bills.length > 0;

  async function restore(file: File | undefined) {
    setProblem("");
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("too big");
      const parsed = sanitize(JSON.parse(await file.text()));
      if (!parsed) throw new Error("bad");
      onRestore(parsed);
    } catch {
      setProblem(
        "That file couldn’t be read. Pick a backup made by this tracker (a .json file).",
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section
      aria-labelledby="bills-backup"
      className="grid gap-3 border-t border-line pt-5"
    >
      <h2 id="bills-backup" className="font-display text-2xl font-semibold">
        Backups and calendar
      </h2>
      <p className="text-ink/80">
        These files are made in your browser and saved to your device. The
        calendar file adds a repeating reminder for each bill to Google
        Calendar, Apple Calendar or Outlook.
      </p>
      <div className="flex flex-wrap gap-2">
        {has && (
          <>
            <Button
              kind="secondary"
              onClick={() =>
                download(
                  `bills-backup-${stamp}.json`,
                  JSON.stringify(data, null, 2),
                  "application/json",
                )
              }
            >
              Download backup
            </Button>
            <Button
              kind="secondary"
              onClick={() =>
                download(`bills-${stamp}.csv`, toCsv(data), "text/csv")
              }
            >
              Download spreadsheet
            </Button>
            <Button
              kind="secondary"
              onClick={() =>
                download(
                  `bill-due-dates-${stamp}.ics`,
                  toIcs(data, today),
                  "text/calendar",
                )
              }
            >
              Add due dates to a calendar
            </Button>
          </>
        )}
        <Button kind="secondary" onClick={() => fileRef.current?.click()}>
          Restore a backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => restore(e.target.files?.[0])}
        />
      </div>
      {problem && <p className="font-bold text-brand-red-dark">{problem}</p>}
      {has && (
        <div className="flex flex-wrap items-center gap-2">
          {confirmClear ? (
            <>
              <span className="font-semibold">
                Erase every bill from this browser? This can’t be undone.
              </span>
              <Button
                onClick={() => {
                  setConfirmClear(false);
                  onCleared();
                }}
              >
                Erase everything
              </Button>
              <Button kind="quiet" onClick={() => setConfirmClear(false)}>
                Keep my bills
              </Button>
            </>
          ) : (
            <Button
              kind="quiet"
              onClick={() => setConfirmClear(true)}
              className="text-brand-red-dark"
            >
              Clear everything
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
