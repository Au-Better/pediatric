// Yearly limits for the retirement accounts guide, for this year and next.
// Each year's column names the IRS documents it comes from. When the IRS announces a new year
// (usually October or November), add a column and drop the oldest one.

import type { FinanceCited } from "./sources";

export interface LimitYear {
  year: number;
  cite: FinanceCited;
  /** 403(b), 401(k), governmental 457(b) and TSP elective deferrals; each 457(b) has its own. */
  deferral: number;
  catchUp50: number;
  catchUp60to63: number;
  /** Total that you and your employer together can put in one 401(k) or 403(b) (section 415(c)). */
  totalAdditions: number;
  ira: number;
  iraCatchUp50: number;
  /** Modified AGI ranges over which a direct Roth IRA contribution phases out. */
  rothPhaseOut: { single: [number, number]; married: [number, number] };
  /** Ranges over which a traditional IRA deduction phases out if you're covered by a workplace plan. */
  iraDeductionPhaseOut: { single: [number, number]; married: [number, number] };
  /** If last year's wages from this employer were over this, catch-up contributions must be Roth. */
  rothCatchUpWageThreshold: number;
  hsa: { self: number; family: number };
  hsaCatchUp55: number;
}

export const LIMITS: LimitYear[] = [
  {
    year: 2026,
    cite: ["irsLimits2026", "irsNotice202567", "irsHsa2026", "irsP969"],
    deferral: 24_500,
    catchUp50: 8_000,
    catchUp60to63: 11_250,
    totalAdditions: 72_000,
    ira: 7_500,
    iraCatchUp50: 1_100,
    rothPhaseOut: { single: [153_000, 168_000], married: [242_000, 252_000] },
    iraDeductionPhaseOut: {
      single: [81_000, 91_000],
      married: [129_000, 149_000],
    },
    rothCatchUpWageThreshold: 150_000,
    hsa: { self: 4_400, family: 8_750 },
    hsaCatchUp55: 1_000,
  },
  {
    year: 2027,
    cite: ["irsLimits2027", "irsNotice202666", "irsHsa2027", "irsP969"],
    deferral: 25_500,
    catchUp50: 8_500,
    catchUp60to63: 11_750,
    totalAdditions: 75_000,
    ira: 7_500,
    iraCatchUp50: 1_100,
    rothPhaseOut: { single: [158_000, 173_000], married: [250_000, 260_000] },
    iraDeductionPhaseOut: {
      single: [83_000, 93_000],
      married: [133_000, 153_000],
    },
    rothCatchUpWageThreshold: 155_000,
    hsa: { self: 4_500, family: 9_000 },
    hsaCatchUp55: 1_000,
  },
];
