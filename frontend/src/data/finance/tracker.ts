// The bills and loans tracker's data and math.
//
// Everything a visitor enters is kept in their own browser (localStorage) under STORAGE_KEY.
// Nothing is sent to Au Better or anyone else. The paycheck tool reads the same key, read-only,
// to show what is left after bills.

export const STORAGE_KEY = "aubetter.finance.bills.v1";

export type BillKind =
  | "creditCard"
  | "studentLoan"
  | "mortgage"
  | "rent"
  | "carLoan"
  | "personalLoan"
  | "other";

export const BILL_KIND_LABEL: Record<BillKind, string> = {
  creditCard: "Credit card",
  studentLoan: "Student loan",
  mortgage: "Mortgage",
  rent: "Rent",
  carLoan: "Car loan",
  personalLoan: "Personal loan",
  other: "Other bill",
};

/** Kinds that carry a balance that goes down as you pay. */
export const DEBT_KINDS: BillKind[] = [
  "creditCard",
  "studentLoan",
  "mortgage",
  "carLoan",
  "personalLoan",
];

export type Frequency = "monthly" | "yearly";

export interface Payment {
  id: string;
  /** The due date this payment covers, as YYYY-MM-DD. */
  covers: string;
  /** The day it was paid, as YYYY-MM-DD. */
  paidOn: string;
  amount: number;
}

export interface Bill {
  id: string;
  name: string;
  kind: BillKind;
  /** The usual amount due each time (the minimum payment for a card). */
  payment: number;
  frequency: Frequency;
  /** Day of the month it's due, 1 to 31. A day past the month's end means the last day. */
  dueDay: number;
  /** For yearly bills, the month it's due, 1 to 12. */
  dueMonth: number;
  balance: number | null;
  /** Interest rate as a yearly percentage, such as 6.53. */
  apr: number | null;
  autopay: boolean;
  payments: Payment[];
  /** The day the bill was added, as YYYY-MM-DD. Due dates before it are never shown as unpaid. */
  addedOn: string;
}

export interface TrackerData {
  version: 1;
  bills: Bill[];
}

export const EMPTY: TrackerData = { version: 1, bills: [] };

// ---- Saving and loading -------------------------------------------------------------------

/** Reads saved bills. Returns null if this browser won't let the page read storage. */
export function loadTracker(): TrackerData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return sanitize(JSON.parse(raw)) ?? EMPTY;
  } catch {
    return null;
  }
}

/** Saves bills. Returns false if the browser refused. */
export function saveTracker(data: TrackerData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearTracker(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

const isDay = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const num = (n: unknown): number | null =>
  typeof n === "number" && Number.isFinite(n) ? n : null;

/** Checks data read from storage or from a backup file, keeping only well-formed bills. */
export function sanitize(value: unknown): TrackerData | null {
  if (!value || typeof value !== "object") return null;
  const bills = (value as { bills?: unknown }).bills;
  if (!Array.isArray(bills)) return null;
  const clean: Bill[] = [];
  for (const b of bills) {
    if (!b || typeof b !== "object") continue;
    const bill = b as Record<string, unknown>;
    const kind = bill.kind as BillKind;
    const payment = num(bill.payment);
    const dueDay = num(bill.dueDay);
    if (
      typeof bill.name !== "string" ||
      !(kind in BILL_KIND_LABEL) ||
      payment === null ||
      dueDay === null
    )
      continue;
    const payments = Array.isArray(bill.payments)
      ? (bill.payments as Record<string, unknown>[]).flatMap((p) =>
          p && isDay(p.covers) && isDay(p.paidOn) && num(p.amount) !== null
            ? [
                {
                  id: String(p.id ?? newId()),
                  covers: p.covers,
                  paidOn: p.paidOn,
                  amount: p.amount as number,
                },
              ]
            : [],
        )
      : [];
    clean.push({
      id: typeof bill.id === "string" ? bill.id : newId(),
      name: bill.name.slice(0, 80),
      kind,
      payment: Math.max(0, payment),
      frequency: bill.frequency === "yearly" ? "yearly" : "monthly",
      dueDay: Math.min(31, Math.max(1, Math.round(dueDay))),
      dueMonth: Math.min(12, Math.max(1, Math.round(num(bill.dueMonth) ?? 1))),
      balance: num(bill.balance),
      apr: num(bill.apr),
      autopay: bill.autopay === true,
      payments,
      addedOn: isDay(bill.addedOn) ? bill.addedOn : toIso(new Date()),
    });
  }
  return { version: 1, bills: clean };
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}

// ---- Dates --------------------------------------------------------------------------------

export function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** The bill's due date in a given month (0-based), moved to the month's last day if needed. */
function dueIn(year: number, month: number, day: number): Date {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last));
}

/**
 * The due dates around today: the most recent one on or before today and the next ones after it.
 * Monthly bills step a month at a time; yearly bills a year at a time.
 */
export function dueDates(bill: Bill, today: Date, count = 3): Date[] {
  const dates: Date[] = [];
  if (bill.frequency === "yearly") {
    let year = today.getFullYear() - 1;
    while (dates.length < count + 1) {
      dates.push(dueIn(year, bill.dueMonth - 1, bill.dueDay));
      year++;
    }
  } else {
    let y = today.getFullYear();
    let m = today.getMonth() - 1;
    while (dates.length < count + 1) {
      if (m < 0) {
        m += 12;
        y--;
      }
      dates.push(dueIn(y, m, bill.dueDay));
      m++;
      if (m > 11) {
        m -= 12;
        y++;
      }
    }
  }
  return dates;
}

export type DueStatus = "paid" | "due" | "unpaid";

export interface DueItem {
  bill: Bill;
  date: Date;
  iso: string;
  /** Whole days from today; negative is in the past. */
  days: number;
  status: DueStatus;
}

const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS,
  );
}

/**
 * What to show for a bill right now: the oldest due date in the last 31 days that hasn't been
 * marked paid, or else the next due date that hasn't been marked paid.
 */
export function currentDue(bill: Bill, today: Date): DueItem {
  const paid = new Set(bill.payments.map((p) => p.covers));
  const dates = dueDates(bill, today, 3);
  for (const date of dates) {
    const iso = toIso(date);
    const days = daysBetween(today, date);
    if (paid.has(iso)) continue;
    if (days < -31 || (days < 0 && iso < bill.addedOn)) continue;
    return { bill, date, iso, days, status: days < 0 ? "unpaid" : "due" };
  }
  const last = dates[dates.length - 1];
  return {
    bill,
    date: last,
    iso: toIso(last),
    days: daysBetween(today, last),
    status: "paid",
  };
}

/** Whether the most recent due date on or before today has been marked paid. */
export function paidThisCycle(bill: Bill, today: Date): boolean {
  const past = dueDates(bill, today, 3).filter(
    (d) => daysBetween(today, d) <= 0,
  );
  const latest = past[past.length - 1];
  return latest ? bill.payments.some((p) => p.covers === toIso(latest)) : false;
}

// ---- Money --------------------------------------------------------------------------------

/** The bill's cost spread over a month. */
export function monthlyCost(bill: Bill): number {
  return bill.frequency === "yearly" ? bill.payment / 12 : bill.payment;
}

/** Interest that builds in one month on the current balance, a simple estimate. */
export function monthlyInterest(bill: Bill): number {
  if (!bill.balance || !bill.apr) return 0;
  return (bill.balance * bill.apr) / 100 / 12;
}

export type Payoff =
  | { kind: "months"; months: number; interest: number }
  | { kind: "never" }
  | { kind: "none" };

/**
 * Months to pay off a balance with the same monthly payment and no new charges, and the total
 * interest along the way. Standard amortization: n = -ln(1 - rB/P) / ln(1 + r).
 */
export function payoff(bill: Bill): Payoff {
  const balance = bill.balance ?? 0;
  if (!(balance > 0) || bill.frequency !== "monthly" || !(bill.payment > 0))
    return { kind: "none" };
  const r = (bill.apr ?? 0) / 100 / 12;
  if (r === 0) {
    const months = Math.ceil(balance / bill.payment);
    return { kind: "months", months, interest: 0 };
  }
  if (bill.payment <= balance * r) return { kind: "never" };
  const n = -Math.log(1 - (r * balance) / bill.payment) / Math.log(1 + r);
  const months = Math.ceil(n - 1e-9);
  const interest = Math.max(0, bill.payment * n - balance);
  return { kind: "months", months, interest };
}

export function describeMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} year${y === 1 ? "" : "s"}`);
  if (m) parts.push(`${m} month${m === 1 ? "" : "s"}`);
  return parts.join(" and ") || "less than a month";
}

// ---- Files ------------------------------------------------------------------------------

function csvCell(value: string | number | null): string {
  if (value === null) return "";
  const s = String(value);
  // Quote everything, and stop a spreadsheet from reading a cell as a formula.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(data: TrackerData): string {
  const header = [
    "Name",
    "Type",
    "Payment",
    "How often",
    "Due day",
    "Due month",
    "Balance",
    "APR %",
    "Autopay",
    "Payments marked paid",
  ];
  const rows = data.bills.map((b) => [
    b.name,
    BILL_KIND_LABEL[b.kind],
    b.payment,
    b.frequency === "yearly" ? "Yearly" : "Monthly",
    b.dueDay,
    b.frequency === "yearly" ? b.dueMonth : "",
    b.balance,
    b.apr,
    b.autopay ? "Yes" : "No",
    b.payments
      .map((p) => `${p.covers} paid ${p.paidOn} ($${p.amount})`)
      .join("; "),
  ]);
  return [header, ...rows]
    .map((r) => r.map((c) => csvCell(c as string | number | null)).join(","))
    .join("\r\n");
}

function icsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * A calendar file with one repeating all-day event per bill. Days 29 to 31 use the last day of
 * shorter months (BYMONTHDAY with BYSETPOS=-1), so no month is skipped.
 */
export function toIcs(data: TrackerData, today: Date): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Au Better//Bill tracker//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const b of data.bills) {
    const first = currentDue(
      { ...b, payments: [], addedOn: toIso(today) },
      today,
    ).date;
    const start = toIso(first).replace(/-/g, "");
    const end = toIso(
      new Date(first.getFullYear(), first.getMonth(), first.getDate() + 1),
    ).replace(/-/g, "");
    let rule: string;
    if (b.dueDay > 28) {
      const days = Array.from({ length: b.dueDay - 27 }, (_, i) => 28 + i).join(
        ",",
      );
      rule =
        b.frequency === "yearly"
          ? `RRULE:FREQ=YEARLY;BYMONTH=${b.dueMonth};BYMONTHDAY=${days};BYSETPOS=-1`
          : `RRULE:FREQ=MONTHLY;BYMONTHDAY=${days};BYSETPOS=-1`;
    } else {
      rule =
        b.frequency === "yearly" ? "RRULE:FREQ=YEARLY" : "RRULE:FREQ=MONTHLY";
    }
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@aubetter.org`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      rule,
      `SUMMARY:${icsText(`${b.name} due ($${b.payment.toFixed(2)})`)}`,
      `DESCRIPTION:${icsText(`${BILL_KIND_LABEL[b.kind]}${b.autopay ? ", on autopay" : ""}. From the Au Better bill tracker.`)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(`${b.name} is due in 3 days`)}`,
      "TRIGGER:-P3D",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export const SAMPLE: TrackerData = {
  version: 1,
  bills: [
    {
      id: "s1",
      name: "Apartment rent",
      kind: "rent",
      payment: 1_350,
      frequency: "monthly",
      dueDay: 1,
      dueMonth: 1,
      balance: null,
      apr: null,
      autopay: false,
      payments: [],
      addedOn: "2000-01-01",
    },
    {
      id: "s2",
      name: "Federal student loans",
      kind: "studentLoan",
      payment: 420,
      frequency: "monthly",
      dueDay: 15,
      dueMonth: 1,
      balance: 210_000,
      apr: 6.5,
      autopay: true,
      payments: [],
      addedOn: "2000-01-01",
    },
    {
      id: "s3",
      name: "Travel card",
      kind: "creditCard",
      payment: 40,
      frequency: "monthly",
      dueDay: 22,
      dueMonth: 1,
      balance: 1_200,
      apr: 24.99,
      autopay: false,
      payments: [],
      addedOn: "2000-01-01",
    },
    {
      id: "s4",
      name: "Car loan",
      kind: "carLoan",
      payment: 389,
      frequency: "monthly",
      dueDay: 28,
      dueMonth: 1,
      balance: 14_500,
      apr: 5.9,
      autopay: true,
      payments: [],
      addedOn: "2000-01-01",
    },
    {
      id: "s5",
      name: "Renter's insurance",
      kind: "other",
      payment: 180,
      frequency: "yearly",
      dueDay: 10,
      dueMonth: 3,
      balance: null,
      apr: null,
      autopay: false,
      payments: [],
      addedOn: "2000-01-01",
    },
  ],
};
