// Shapes for the medical careers roadmap data.
//
// The data is kept apart from the page on purpose, so the same careers can drive
// other things later (for example a classroom "choose your career" game).
// Every step, description, pay figure and outlook figure names at least one source,
// and the build fails if a source id is misspelled or missing.

import type { SourceId } from "./sources";

/** At least one source is required wherever a fact is stated. */
export type Cited = readonly [SourceId, ...SourceId[]];

/**
 * What kind of step this is. It sets the step's color and icon on the page.
 * - school: classroom education (college, graduate or professional school, courses)
 * - training: supervised clinical training after school (residency, clinical fellowship)
 * - exam: a national exam, or a certification earned from a national body
 * - license: a state license
 * - milestone: something that happens along the way and takes no time of its own (applying, the Match)
 */
export type StepKind = "school" | "training" | "exam" | "license" | "milestone";

/** A span of years, smallest and largest typical. Use the same number twice for a fixed length. */
export type YearRange = readonly [min: number, max: number];

export interface Step {
  kind: StepKind;
  title: string;
  /**
   * Years this step adds after high school, if any. Leave it out for steps that take
   * no time of their own, such as an exam taken during school.
   */
  years?: YearRange;
  /**
   * How the length is shown, when the source gives it in other units than whole years,
   * for example "23–27 months". The bar still uses `years`.
   */
  lengthLabel?: string;
  /** One or two plain sentences for a student. */
  detail: string;
  /** How this step differs between programs, states or routes. Shown under "Paths vary". */
  varies?: string;
  /** Optional steps (such as a fellowship) are shown but left out of the total years. */
  optional?: boolean;
  sources: Cited;
}

export type CareerFamily = "physician" | "nursing" | "pa" | "therapy" | "ems";

export interface Pay {
  /** Median yearly wage in US dollars, exactly as the source states it. */
  median: number;
  /** When the median is a floor ("$239,200 or more"), not an exact figure. */
  atLeast?: boolean;
  /** The year of the wage data, as the source labels it. */
  year: number;
  /** The occupation the figure is for, in the source's words, when it is broader than the career. */
  occupation?: string;
  sources: Cited;
}

export interface Outlook {
  /** Projected change in jobs, in percent, exactly as the source states it. */
  percent: number;
  /** The projection period, as the source states it, for example "2025–35". */
  period: string;
  /** The source's own description, for example "Much faster than average", when it gives one. */
  label?: string;
  /** The occupation the figure is for, when it is broader than the career. */
  occupation?: string;
  sources: Cited;
}

export interface Career {
  /** Short, stable id used in links (?career=pediatrics). Never change it once published. */
  id: string;
  name: string;
  /** Other common names for the career. */
  alsoCalled?: string;
  family: CareerFamily;
  /** The letters after the name once qualified, for example "MD or DO" or "PA-C". */
  credential: string;
  /** One line on what the job is like. */
  about: string;
  aboutSources: Cited;
  /** Something a student should know about the career as a whole, such as a change of title. */
  note?: { text: string; sources: Cited };
  steps: readonly Step[];
  /**
   * How the total time is described, when a number would mislead, for example
   * "Less than 1 year" when the source gives only an upper limit.
   */
  totalLabel?: string;
  pay?: Pay;
  outlook?: Outlook;
}

export interface Source {
  publisher: string;
  title: string;
  url: string;
  /** The day the page was read for this data, YYYY-MM-DD. */
  accessed: string;
}
