// Small building blocks shared by the clinician finance tools, styled to match the dose calculator.

import type { ReactNode } from "react";
import {
  financeSources,
  type FinanceSourceId,
} from "../../data/finance/sources";

export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-red-dark";

/** The white panel each tool sits in. */
export const panel =
  "rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgb(31_31_31/0.04),0_12px_32px_rgb(31_31_31/0.06)] sm:p-8";

export const inputClass = `h-12 w-full min-w-0 rounded-2xl border-[1.5px] border-line bg-white px-4 font-semibold tabular-nums placeholder:text-[#a39b8d] focus:border-ink ${focusRing}`;

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1,234 */
export function money(n: number): string {
  return usd0.format(Math.round(n));
}

/** $1,234.56 */
export function moneyCents(n: number): string {
  return usd2.format(n);
}

/** Reads a dollar amount typed by a person, allowing "$1,200" or "1200.50". Empty or bad input gives NaN. */
export function parseMoney(text: string): number {
  const cleaned = text.replace(/[$,\s]/g, "");
  if (!/^\d*\.?\d+$/.test(cleaned)) return NaN;
  return parseFloat(cleaned);
}

/** "Nov 15, 2026" from "2026-11-15", read as a calendar day (no time zone shift). */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** The educational note at the top of every finance tool. Yellow is kept for notes like this. */
export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warn-line bg-warn px-3.5 py-3 leading-snug">
      <span
        aria-hidden="true"
        className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-warn"
      >
        !
      </span>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

export function EducationalNote() {
  return (
    <Warning>
      <p>
        <strong>Educational only, not financial, tax or legal advice.</strong>{" "}
        Everyone’s situation is different. Check with a licensed professional
        before making decisions.
      </p>
    </Warning>
  );
}

export function Summary({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <summary
      className={`flex min-h-13 cursor-pointer list-none items-center gap-2.5 rounded-2xl px-4 py-2.5 font-extrabold [&::-webkit-details-marker]:hidden ${focusRing} ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-white font-display text-lg leading-none font-bold text-brand-red-dark"
      >
        <span className="group-open:hidden">+</span>
        <span className="hidden group-open:inline">−</span>
      </span>
      {children}
    </summary>
  );
}

export function More({
  summary,
  children,
  open = false,
}: {
  summary: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="group rounded-2xl bg-cream-light" open={open}>
      <Summary>{summary}</Summary>
      <div className="grid gap-3 px-4 pb-4">{children}</div>
    </details>
  );
}

export function Button({
  onClick,
  children,
  kind = "primary",
  className = "",
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  kind?: "primary" | "secondary" | "quiet";
  className?: string;
  type?: "button" | "submit";
}) {
  const look =
    kind === "primary"
      ? "bg-brand-red text-white hover:bg-brand-red-dark"
      : kind === "secondary"
        ? "border-[1.5px] border-line bg-white text-ink hover:border-brand-red-dark hover:bg-cream-light"
        : "text-ink/80 hover:bg-cream-light hover:text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`min-h-11 rounded-full px-5 py-2 font-display text-lg font-semibold transition-colors ${look} ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

/** A list of sources, numbered in the order given, for the foot of a tool. */
export function SourceList({
  ids,
  heading = "Sources",
}: {
  ids: readonly FinanceSourceId[];
  heading?: string;
}) {
  const unique = [...new Set(ids)];
  return (
    <details className="group mt-4">
      <Summary className="text-ink/80">{heading}</Summary>
      <ol className="grid list-decimal gap-1.5 px-4 pb-4 pl-10 text-[0.95rem] text-ink/80">
        {unique.map((id) => {
          const s = financeSources[id];
          return (
            <li key={id}>
              {s.publisher},{" "}
              <a
                href={s.url}
                className="text-ink underline underline-offset-2"
                rel="noopener"
              >
                {s.title}
              </a>
              . Read {formatDay(s.accessed)}.
            </li>
          );
        })}
      </ol>
    </details>
  );
}
