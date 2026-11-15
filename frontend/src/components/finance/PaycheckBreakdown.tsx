// The paycheck graphic for the clinician finance section: a doctor's gross pay for a month (or a
// year), where each piece of it goes, and what is left as take-home pay. If the visitor uses the
// bills tracker on this site, it can also show what is left after those bills.
//
// The tax math and the example salaries live in data/finance/paycheck.ts, with their sources.

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  DEFERRAL_LIMIT,
  EXAMPLES,
  FEDERAL,
  HSA_FAMILY_LIMIT,
  PAYROLL,
  TAX_YEAR,
  computePaycheck,
  type FilingStatus,
  type PaycheckInputs,
  type PaycheckSlice,
  type StateChoice,
} from "../../data/finance/paycheck";
import { loadTracker, monthlyCost } from "../../data/finance/tracker";
import {
  EducationalNote,
  More,
  SourceList,
  Warning,
  focusRing,
  inputClass,
  money,
  panel,
  parseMoney,
} from "./ui";

/** The four groups the bar is split into, in their fixed order. Colors passed the CVD check on white. */
const GROUPS = [
  { id: "takeHome", label: "Take-home pay", color: "#008300" },
  { id: "savings", label: "Retirement and HSA savings", color: "#2a78d6" },
  { id: "tax", label: "Taxes", color: "#ed1d27" },
  { id: "benefits", label: "Insurance and other deductions", color: "#6250d6" },
] as const;

type GroupId = (typeof GROUPS)[number]["id"];

function groupOf(slice: PaycheckSlice): GroupId {
  if (slice.kind === "savings") return "savings";
  if (slice.kind === "tax") return "tax";
  return "benefits";
}

type FieldKey = Exclude<keyof PaycheckInputs, "filing" | "state">;
type Fields = Record<FieldKey, string>;

function toFields(inputs: PaycheckInputs): Fields {
  return {
    salary: String(inputs.salary),
    traditional403b: String(inputs.traditional403b),
    roth403b: String(inputs.roth403b),
    traditional457b: String(inputs.traditional457b),
    healthPremiumMonthly: String(inputs.healthPremiumMonthly),
    hsaMonthly: String(inputs.hsaMonthly),
    afterTaxMonthly: String(inputs.afterTaxMonthly),
  };
}

/** Empty means zero; anything that isn't a number is flagged and treated as zero. */
function readField(text: string): { value: number; bad: boolean } {
  if (!text.trim()) return { value: 0, bad: false };
  const n = parseMoney(text);
  return Number.isFinite(n)
    ? { value: n, bad: false }
    : { value: 0, bad: true };
}

const pct = (n: number) => `${(n * 100).toFixed(1).replace(/\.0$/, "")}%`;

export default function PaycheckBreakdown({
  trackerHref,
}: {
  trackerHref?: string;
}) {
  const id = useId();
  const [example, setExample] = useState<"resident" | "attending" | "custom">(
    "resident",
  );
  const [fields, setFields] = useState<Fields>(() =>
    toFields(EXAMPLES[0].inputs),
  );
  const [filing, setFiling] = useState<FilingStatus>(EXAMPLES[0].inputs.filing);
  const [state, setState] = useState<StateChoice>(EXAMPLES[0].inputs.state);
  const [perMonth, setPerMonth] = useState(true);
  const [active, setActive] = useState<GroupId | null>(null);
  const [bills, setBills] = useState<{ count: number; monthly: number } | null>(
    null,
  );

  // The bills tracker saves in this browser only; read it after the page loads.
  useEffect(() => {
    const data = loadTracker();
    if (data && data.bills.length > 0) {
      setBills({
        count: data.bills.length,
        monthly: data.bills.reduce((s, b) => s + monthlyCost(b), 0),
      });
    }
  }, []);

  function pickExample(next: "resident" | "attending" | "custom") {
    setExample(next);
    const found = EXAMPLES.find((e) => e.id === next);
    if (found) {
      setFields(toFields(found.inputs));
      setFiling(found.inputs.filing);
      setState(found.inputs.state);
    }
  }

  function setField(key: FieldKey, text: string) {
    setFields((f) => ({ ...f, [key]: text }));
    setExample("custom");
  }

  const read = useMemo(() => {
    const out = {} as Record<FieldKey, number>;
    const bad: FieldKey[] = [];
    for (const key of Object.keys(fields) as FieldKey[]) {
      const r = readField(fields[key]);
      out[key] = r.value;
      if (r.bad) bad.push(key);
    }
    return { values: out, bad };
  }, [fields]);

  const result = useMemo(
    () => computePaycheck({ ...read.values, filing, state }),
    [read.values, filing, state],
  );

  const div = perMonth ? 12 : 1;
  const unit = perMonth ? "a month" : "a year";
  const gross = result.gross / div;
  const takeHome = result.takeHome / div;

  const groups = GROUPS.map((g) => ({
    ...g,
    amount:
      g.id === "takeHome"
        ? takeHome
        : result.slices
            .filter((s) => groupOf(s) === g.id)
            .reduce((sum, s) => sum + s.annual, 0) / div,
  }));

  const billsAmount = bills
    ? perMonth
      ? bills.monthly
      : bills.monthly * 12
    : 0;
  const afterBills = takeHome - billsAmount;
  const selected = EXAMPLES.find((e) => e.id === example);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-6 ${panel}`}>
        <EducationalNote />

        <div className="grid gap-3">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-[0.95rem] font-extrabold">
              Whose paycheck?
            </legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["resident", "Resident"],
                  ["attending", "Attending"],
                  ["custom", "Your own numbers"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex min-h-11 cursor-pointer items-center rounded-full border-[1.5px] px-4.5 font-display text-lg font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-brand-red-dark ${
                    example === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white hover:border-brand-red-dark hover:bg-cream-light"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-example`}
                    value={value}
                    checked={example === value}
                    onChange={() => pickExample(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          {selected ? (
            <p className="text-[0.95rem] leading-snug text-ink/80">
              {selected.description} Single filer in New Mexico; the deductions
              are made-up examples.
            </p>
          ) : (
            <p className="text-[0.95rem] leading-snug text-ink/80">
              Change any number under “Change the numbers” below.
            </p>
          )}
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid gap-0.5">
              <p className="text-sm font-extrabold tracking-wide text-ink/80 uppercase">
                Take-home pay
              </p>
              <p className="font-display text-5xl leading-none font-bold tabular-nums">
                {money(takeHome)}
                <span className="ml-2 text-2xl font-semibold text-ink/80">
                  {unit}
                </span>
              </p>
              <p className="text-ink/80">
                out of{" "}
                <strong className="text-ink tabular-nums">
                  {money(gross)}
                </strong>{" "}
                gross pay. Taxes take{" "}
                <strong className="text-ink">{pct(result.totalTaxRate)}</strong>
                .
              </p>
            </div>
            <div
              className="flex rounded-full bg-cream-light p-1"
              role="group"
              aria-label="Show amounts"
            >
              {[true, false].map((m) => (
                <button
                  key={String(m)}
                  type="button"
                  aria-pressed={perMonth === m}
                  onClick={() => setPerMonth(m)}
                  className={`min-h-10 rounded-full px-4 font-bold ${focusRing} ${
                    perMonth === m
                      ? "bg-white shadow-sm"
                      : "text-ink/80 hover:text-ink"
                  }`}
                >
                  {m ? "Per month" : "Per year"}
                </button>
              ))}
            </div>
          </div>

          <SegmentedBar
            groups={groups}
            gross={gross}
            unit={unit}
            active={active}
            setActive={setActive}
          />

          <ul
            className="grid gap-2 sm:grid-cols-2"
            aria-label="What the bar shows"
          >
            {groups.map((g) => (
              <li
                key={g.id}
                className="flex items-center gap-2.5"
                onMouseEnter={() => setActive(g.id)}
                onMouseLeave={() => setActive(null)}
              >
                <span
                  aria-hidden="true"
                  className="size-3.5 shrink-0 rounded-[4px]"
                  style={{ background: g.color }}
                />
                <span className="font-semibold">{g.label}</span>
                <span className="ml-auto tabular-nums text-ink/80 sm:ml-0">
                  {money(g.amount)} · {gross > 0 ? pct(g.amount / gross) : "0%"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <section aria-labelledby={`${id}-steps`} className="grid gap-3">
          <h2
            id={`${id}-steps`}
            className="font-display text-2xl font-semibold"
          >
            From gross pay to money you can spend
          </h2>
          <Waterfall
            gross={gross}
            slices={result.slices.map((s) => ({
              ...s,
              amount: s.annual / div,
            }))}
            takeHome={takeHome}
            bills={bills ? { count: bills.count, amount: billsAmount } : null}
            afterBills={afterBills}
          />
          <p className="text-[0.95rem] leading-snug text-ink/80">
            Retirement and HSA money is still yours, but it’s set aside for
            later, so it isn’t money you can spend this month. Take-home pay is
            what lands in your bank account.
          </p>
          {bills === null && trackerHref && (
            <p className="leading-snug">
              Add your rent, loans and cards to the{" "}
              <a
                href={trackerHref}
                className="font-bold text-brand-red-dark underline underline-offset-2"
              >
                bills and loans tracker
              </a>{" "}
              and this chart will also show what’s left after them.
            </p>
          )}
        </section>

        {(result.capped.plan403b ||
          result.capped.plan457b ||
          result.capped.hsa ||
          result.capped.overPay ||
          read.bad.length > 0) && (
          <Warning>
            {read.bad.length > 0 && (
              <p>
                Some numbers couldn’t be read, so they count as $0. Use digits,
                like 1,250.
              </p>
            )}
            {(result.capped.plan403b || result.capped.plan457b) && (
              <p>
                Retirement contributions were capped at the {TAX_YEAR} limit of{" "}
                {money(DEFERRAL_LIMIT.amount)} per plan (a 457(b) has its own
                limit). People 50 and older can add catch-up contributions,
                which this tool leaves out.
              </p>
            )}
            {result.capped.hsa && (
              <p>
                HSA contributions were capped at the {TAX_YEAR} family limit of{" "}
                {money(HSA_FAMILY_LIMIT.amount)}.
              </p>
            )}
            {result.capped.overPay && (
              <p>
                The deductions added up to more than 90% of pay, so they were
                scaled down to fit.
              </p>
            )}
          </Warning>
        )}

        <More summary="Change the numbers" open={example === "custom"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id={`${id}-salary`}
              label="Yearly salary"
              value={fields.salary}
              onChange={(v) => setField("salary", v)}
            />
            <div className="grid content-start gap-1.5">
              <label
                htmlFor={`${id}-filing`}
                className="text-[0.95rem] font-extrabold"
              >
                Tax filing status
              </label>
              <select
                id={`${id}-filing`}
                className={inputClass}
                value={filing}
                onChange={(e) => {
                  setFiling(e.target.value as FilingStatus);
                  setExample("custom");
                }}
              >
                <option value="single">Single</option>
                <option value="married">
                  Married filing jointly (this salary only)
                </option>
              </select>
            </div>
            <div className="grid content-start gap-1.5">
              <label
                htmlFor={`${id}-state`}
                className="text-[0.95rem] font-extrabold"
              >
                State income tax
              </label>
              <select
                id={`${id}-state`}
                className={inputClass}
                value={state}
                onChange={(e) => {
                  setState(e.target.value as StateChoice);
                  setExample("custom");
                }}
              >
                <option value="nm">New Mexico</option>
                <option value="none">None (a state with no income tax)</option>
              </select>
            </div>
            <NumberField
              id={`${id}-403b`}
              label="Pretax 403(b) or 401(k), per year"
              value={fields.traditional403b}
              onChange={(v) => setField("traditional403b", v)}
            />
            <NumberField
              id={`${id}-roth`}
              label="Roth 403(b) or 401(k), per year"
              value={fields.roth403b}
              onChange={(v) => setField("roth403b", v)}
            />
            <NumberField
              id={`${id}-457b`}
              label="Pretax 457(b), per year"
              value={fields.traditional457b}
              onChange={(v) => setField("traditional457b", v)}
            />
            <NumberField
              id={`${id}-health`}
              label="Health, dental and vision, per month"
              hint="Premiums taken out before tax."
              value={fields.healthPremiumMonthly}
              onChange={(v) => setField("healthPremiumMonthly", v)}
            />
            <NumberField
              id={`${id}-hsa`}
              label="HSA through payroll, per month"
              value={fields.hsaMonthly}
              onChange={(v) => setField("hsaMonthly", v)}
            />
            <NumberField
              id={`${id}-after`}
              label="Other after-tax deductions, per month"
              hint="Disability insurance, parking, dues."
              value={fields.afterTaxMonthly}
              onChange={(v) => setField("afterTaxMonthly", v)}
            />
          </div>
        </More>

        <More summary="How this is worked out">
          <ul className="grid list-disc gap-2 pl-5 leading-snug">
            <li>
              Uses {TAX_YEAR} federal brackets and the standard deduction (
              {money(FEDERAL.standardDeduction.single)} single,{" "}
              {money(FEDERAL.standardDeduction.married)} married). No credits,
              itemized deductions or other income are counted.
            </li>
            <li>
              Social Security is {pct(PAYROLL.socialSecurityRate)} of wages up
              to {money(PAYROLL.socialSecurityWageBase)}. Medicare is{" "}
              {pct(PAYROLL.medicareRate)} of all wages, plus{" "}
              {pct(PAYROLL.additionalMedicareRate)} over{" "}
              {money(PAYROLL.additionalMedicareThreshold)}.
            </li>
            <li>
              Pretax 403(b), 401(k) and 457(b) money lowers income tax but not
              Social Security or Medicare. Health premiums and HSA money taken
              out through payroll lower both.
            </li>
            <li>
              New Mexico tax starts from the same taxable income as the federal
              return, using New Mexico’s {TAX_YEAR} brackets.
            </li>
            <li>
              This is a yearly estimate split into months. Your paycheck
              withholding may be higher or lower, and any difference shows up
              when you file.
            </li>
            <li>
              Some public employers don’t take out Social Security and use a
              pension instead, and many require a pension contribution. Check
              your own pay stub.
            </li>
            <li>
              For married couples, it counts this salary only, not a spouse’s
              pay.
            </li>
          </ul>
        </More>

        <SourceList
          ids={[
            ...(selected?.cite ?? []),
            "irsTax2026",
            "irsTc751",
            "ssaWageBase2026",
            "irsTc424",
            "irsP15b",
            "irsP969",
            "nmHB252",
            "nmConformity",
            "irsNotice202567",
            "irsHsa2026",
          ]}
        />
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-[0.95rem] font-extrabold">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-ink/60"
        >
          $
        </span>
        <input
          id={id}
          className={`${inputClass} pl-8`}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {hint && <p className="text-sm leading-snug text-ink/80">{hint}</p>}
    </div>
  );
}

interface GroupAmount {
  id: GroupId;
  label: string;
  color: string;
  amount: number;
}

/** One bar for gross pay, split into the four groups. Hover or focus a piece to read it. */
function SegmentedBar({
  groups,
  gross,
  unit,
  active,
  setActive,
}: {
  groups: GroupAmount[];
  gross: number;
  unit: string;
  active: GroupId | null;
  setActive: (g: GroupId | null) => void;
}) {
  const shown = groups.filter((g) => g.amount > 0.005 * gross);
  const current = groups.find((g) => g.id === active);
  return (
    <div className="grid gap-2">
      <p className="min-h-6 text-[0.95rem] font-semibold" aria-live="polite">
        {current && gross > 0
          ? `${current.label}: ${money(current.amount)} ${unit}, ${pct(current.amount / gross)} of gross pay`
          : "Point at or tab to a piece of the bar to read it."}
      </p>
      <div
        className="flex h-16 w-full gap-[2px] overflow-hidden rounded-[10px] bg-white"
        role="img"
        aria-label={`Gross pay of ${money(gross)} ${unit}: ${groups
          .map((g) => `${g.label} ${money(g.amount)}`)
          .join(", ")}.`}
        onMouseLeave={() => setActive(null)}
      >
        {shown.map((g, i) => (
          <div
            key={g.id}
            tabIndex={0}
            aria-label={`${g.label}: ${money(g.amount)}`}
            onMouseEnter={() => setActive(g.id)}
            onFocus={() => setActive(g.id)}
            onBlur={() => setActive(null)}
            className={`h-full min-w-1 transition-opacity ${focusRing} ${i === 0 ? "rounded-l-[10px]" : ""} ${
              i === shown.length - 1 ? "rounded-r-[10px]" : ""
            } ${active && active !== g.id ? "opacity-40" : ""}`}
            style={{ flexGrow: g.amount, flexBasis: 0, background: g.color }}
          />
        ))}
      </div>
    </div>
  );
}

interface WaterfallSlice extends PaycheckSlice {
  amount: number;
}

/** Rows from gross pay down to take-home: each deduction is a floating bar where it comes off. */
function Waterfall({
  gross,
  slices,
  takeHome,
  bills,
  afterBills,
}: {
  gross: number;
  slices: WaterfallSlice[];
  takeHome: number;
  bills: { count: number; amount: number } | null;
  afterBills: number;
}) {
  const scale = (n: number) =>
    gross > 0 ? Math.max(0, Math.min(100, (n / gross) * 100)) : 0;
  let running = gross;
  const rows: ReactNode[] = [];

  rows.push(
    <Row
      key="gross"
      label="Gross pay"
      note="What your contract or offer says, before anything comes out."
      amount={money(gross)}
      strong
    >
      <Bar left={0} width={100} color="#1f1f1f" muted />
    </Row>,
  );
  for (const s of slices) {
    const after = running - s.amount;
    const color = GROUPS.find((g) => g.id === groupOf(s))!.color;
    rows.push(
      <Row
        key={s.id}
        label={s.label}
        note={s.note}
        amount={`− ${money(s.amount)}`}
        swatch={color}
      >
        <Bar left={scale(after)} width={scale(s.amount)} color={color} />
      </Row>,
    );
    running = after;
  }
  rows.push(
    <Row
      key="take"
      label="Take-home pay"
      note="What reaches your bank account."
      amount={money(takeHome)}
      strong
      swatch={GROUPS[0].color}
    >
      <Bar left={0} width={scale(takeHome)} color={GROUPS[0].color} />
    </Row>,
  );
  if (bills) {
    rows.push(
      <Row
        key="bills"
        label="Bills you track"
        note={`The ${bills.count} bill${bills.count === 1 ? "" : "s"} in your tracker on this device, with yearly bills spread out.`}
        amount={`− ${money(bills.amount)}`}
        swatch="#8a8378"
      >
        <Bar
          left={scale(Math.max(0, afterBills))}
          width={scale(Math.min(bills.amount, takeHome))}
          color="#8a8378"
        />
      </Row>,
      <Row
        key="left"
        label="Left after those bills"
        note={
          afterBills < 0
            ? "Your tracked bills are more than your take-home pay."
            : "For food, gas, savings and everything else."
        }
        amount={afterBills < 0 ? `− ${money(-afterBills)}` : money(afterBills)}
        strong
      >
        <Bar left={0} width={scale(Math.max(0, afterBills))} color="#1f1f1f" />
      </Row>,
    );
  }

  return <ol className="grid gap-1">{rows}</ol>;
}

function Row({
  label,
  note,
  amount,
  strong = false,
  swatch,
  children,
}: {
  label: string;
  note: string;
  amount: string;
  strong?: boolean;
  swatch?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={`grid gap-1.5 rounded-2xl px-3 py-2.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-4 ${strong ? "bg-cream-light" : ""}`}
    >
      <div className="grid gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={`flex items-center gap-2 ${strong ? "font-extrabold" : "font-semibold"}`}
          >
            {swatch && (
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-[3px]"
                style={{ background: swatch }}
              />
            )}
            {label}
          </span>
          <span
            className={`tabular-nums ${strong ? "font-extrabold" : "font-semibold"}`}
          >
            {amount}
          </span>
        </div>
        <span className="text-sm leading-snug text-ink/80">{note}</span>
      </div>
      <div aria-hidden="true">{children}</div>
    </li>
  );
}

function Bar({
  left,
  width,
  color,
  muted = false,
}: {
  left: number;
  width: number;
  color: string;
  muted?: boolean;
}) {
  return (
    <div className="relative h-4 w-full rounded-[4px] bg-cream-light">
      <div
        className="absolute inset-y-0 rounded-[4px]"
        style={{
          left: `${left}%`,
          width: `max(${width}%, 2px)`,
          background: color,
          opacity: muted ? 0.18 : 1,
        }}
      />
    </div>
  );
}
