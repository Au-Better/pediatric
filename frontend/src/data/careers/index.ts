// Helpers shared by the careers page (and anything else that uses the careers data).

import { careers } from "./careers";
import { sources, type SourceId } from "./sources";
import type { Career, CareerFamily, Step, YearRange } from "./types";

export { careers, sources };
export type { SourceId };
export type * from "./types";

/** Display order and names for the groups on the page. */
export const families: readonly { id: CareerFamily; name: string }[] = [
  { id: "physician", name: "Physicians (MD or DO)" },
  { id: "nursing", name: "Nursing" },
  { id: "pa", name: "Physician associate" },
  { id: "therapy", name: "Therapy" },
  { id: "ems", name: "Emergency medical services" },
];

/** Years from finishing high school to working in the career, leaving out optional steps. */
export function totalYears(career: Career): YearRange {
  let min = 0;
  let max = 0;
  for (const step of career.steps) {
    if (step.optional || !step.years) continue;
    min += step.years[0];
    max += step.years[1];
  }
  return [round(min), round(max)];
}

/** The steps that take time of their own and count toward the total. */
export function timedSteps(career: Career): Step[] {
  return career.steps.filter((s) => !s.optional && s.years);
}

export function getCareer(id: string | null | undefined): Career | undefined {
  return id ? careers.find((c) => c.id === id) : undefined;
}

/**
 * The total time to show for a career: the career's own label if it has one, otherwise the
 * total rounded to whole years ("About 11 years", "About 6–7 years"). Steps are often given
 * in months, so a decimal total would look more exact than the sources are.
 */
export function formatTotal(career: Career): string {
  if (career.totalLabel) return career.totalLabel;
  const [min, max] = totalYears(career);
  const lo = Math.round(min);
  const hi = Math.round(max);
  const exact = lo === min && hi === max;
  const span = lo === hi ? `${lo}` : `${lo}–${hi}`;
  return `${exact ? "" : "About "}${span} ${hi === 1 ? "year" : "years"}`;
}

/** Short form of formatTotal for tight spaces ("11 yrs", "<1 yr"). */
export function formatTotalShort(career: Career): string {
  if (career.totalLabel) return career.totalLabel.replace(/^Less than 1 year$/, "<1 yr");
  const [min, max] = totalYears(career);
  const lo = Math.round(min);
  const hi = Math.round(max);
  return `${lo === min && hi === max ? "" : "~"}${lo === hi ? lo : `${lo}–${hi}`} yrs`;
}

/** "4", "2–4" or "1.5" (years). */
export function formatYears([min, max]: YearRange): string {
  return min === max ? formatNumber(min) : `${formatNumber(min)}–${formatNumber(max)}`;
}

export function yearsWord([, max]: YearRange): string {
  return max === 1 ? "year" : "years";
}

/** Each source's number in the list at the foot of the page, counting from 1. */
export const sourceNumber: Readonly<Record<SourceId, number>> = Object.fromEntries(
  (Object.keys(sources) as SourceId[]).map((id, i) => [id, i + 1]),
) as Record<SourceId, number>;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
