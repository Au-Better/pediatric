// Tax figures and the math behind "Where a doctor's paycheck goes".
//
// Everything is for the 2026 tax year. To move to a new year, update TAX_YEAR and each table
// below from the sources named next to it, then update the "accessed" dates in sources.ts.
//
// The math is an estimate of yearly tax, spread evenly over 12 months. Real paychecks are
// usually close but not the same, because employers withhold using IRS withholding tables
// and the employee's W-4, and the real tax bill depends on the whole return.

import type { FinanceCited } from "./sources";

export const TAX_YEAR = 2026;

export type FilingStatus = "single" | "married";

/** One bracket: the rate that applies to taxable income above `over`. */
interface Bracket {
  over: number;
  rate: number;
}

/** 2026 federal income tax. Source: IRS IR-2025-103 (Rev. Proc. 2025-32). */
export const FEDERAL = {
  cite: ["irsTax2026"] as FinanceCited,
  standardDeduction: { single: 16_100, married: 32_200 },
  brackets: {
    single: [
      { over: 0, rate: 0.1 },
      { over: 12_400, rate: 0.12 },
      { over: 50_400, rate: 0.22 },
      { over: 105_700, rate: 0.24 },
      { over: 201_775, rate: 0.32 },
      { over: 256_225, rate: 0.35 },
      { over: 640_600, rate: 0.37 },
    ],
    married: [
      { over: 0, rate: 0.1 },
      { over: 24_800, rate: 0.12 },
      { over: 100_800, rate: 0.22 },
      { over: 211_400, rate: 0.24 },
      { over: 403_550, rate: 0.32 },
      { over: 512_450, rate: 0.35 },
      { over: 768_700, rate: 0.37 },
    ],
  } satisfies Record<FilingStatus, Bracket[]>,
};

/**
 * Employee payroll taxes (FICA). Rates: IRS Topic 751. 2026 wage base: SSA, Federal Register,
 * Nov. 3, 2025. The extra 0.9% Medicare tax is withheld on wages over $200,000 in a year,
 * whatever the filing status (IRS Topic 751).
 */
export const PAYROLL = {
  cite: ["irsTc751", "ssaWageBase2026"] as FinanceCited,
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184_500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: 200_000,
};

/**
 * New Mexico personal income tax for taxable years from Jan. 1, 2025 (HB 252, 2024), still in
 * force for 2026. New Mexico starts from federal adjusted gross income and allows the federal
 * standard deduction (NMSA 7-2-2(N)(1), per the legislature's July 2025 conformity presentation).
 */
export const NEW_MEXICO = {
  cite: ["nmHB252", "nmConformity"] as FinanceCited,
  brackets: {
    single: [
      { over: 0, rate: 0.015 },
      { over: 5_500, rate: 0.032 },
      { over: 16_500, rate: 0.043 },
      { over: 33_500, rate: 0.047 },
      { over: 66_500, rate: 0.049 },
      { over: 210_000, rate: 0.059 },
    ],
    married: [
      { over: 0, rate: 0.015 },
      { over: 8_000, rate: 0.032 },
      { over: 25_000, rate: 0.043 },
      { over: 50_000, rate: 0.047 },
      { over: 100_000, rate: 0.049 },
      { over: 315_000, rate: 0.059 },
    ],
  } satisfies Record<FilingStatus, Bracket[]>,
};

/** 2026 elective deferral limits used to cap the inputs. Source: IRS Notice 2025-67. */
export const DEFERRAL_LIMIT = {
  amount: 24_500,
  cite: ["irsNotice202567"] as FinanceCited,
};

/** 2026 HSA limit for family coverage. Source: Rev. Proc. 2025-19. */
export const HSA_FAMILY_LIMIT = {
  amount: 8_750,
  cite: ["irsHsa2026"] as FinanceCited,
};

export type StateChoice = "nm" | "none";

export interface PaycheckInputs {
  /** Yearly salary before anything is taken out. */
  salary: number;
  filing: FilingStatus;
  state: StateChoice;
  /** Yearly pretax (traditional) contributions to a 403(b) or 401(k), and any required pretax pension contribution. */
  traditional403b: number;
  /** Yearly Roth contributions to a 403(b) or 401(k). Taxed now, so they don't lower income tax. */
  roth403b: number;
  /** Yearly pretax contributions to a 457(b). */
  traditional457b: number;
  /** Monthly health, dental and vision premiums taken out before tax (through a cafeteria plan). */
  healthPremiumMonthly: number;
  /** Monthly HSA contributions made through payroll (before tax). */
  hsaMonthly: number;
  /** Monthly deductions taken after tax, such as disability insurance, parking or dues. */
  afterTaxMonthly: number;
}

/** A named example. The salaries come from the sources named; the other amounts are made up for illustration. */
export interface PaycheckExample {
  id: "resident" | "attending";
  label: string;
  description: string;
  cite: FinanceCited;
  inputs: PaycheckInputs;
}

export const EXAMPLES: PaycheckExample[] = [
  {
    id: "resident",
    label: "Resident (PGY-1)",
    description:
      "$68,166 a year, the average first-year resident stipend in the AAMC's 2025 survey (as of July 1, 2025).",
    cite: ["amaResidentPay"],
    inputs: {
      salary: 68_166,
      filing: "single",
      state: "nm",
      traditional403b: 3_400,
      roth403b: 0,
      traditional457b: 0,
      healthPremiumMonthly: 100,
      hsaMonthly: 0,
      afterTaxMonthly: 0,
    },
  },
  {
    id: "attending",
    label: "Attending pediatrician",
    description:
      "$210,040 a year, the median pay for general pediatricians in May 2025 (US Bureau of Labor Statistics).",
    cite: ["blsPhysicians"],
    inputs: {
      salary: 210_040,
      filing: "single",
      state: "nm",
      traditional403b: 24_500,
      roth403b: 0,
      traditional457b: 12_000,
      healthPremiumMonthly: 250,
      hsaMonthly: 0,
      afterTaxMonthly: 100,
    },
  },
];

/** Tax on `income` using progressive brackets. */
export function bracketTax(income: number, brackets: Bracket[]): number {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const { over, rate } = brackets[i];
    const next = brackets[i + 1]?.over ?? Infinity;
    if (income <= over) break;
    tax += (Math.min(income, next) - over) * rate;
  }
  return tax;
}

/** The rate on the next dollar of taxable income. */
export function marginalRate(income: number, brackets: Bracket[]): number {
  let rate = brackets[0].rate;
  for (const b of brackets) if (income > b.over) rate = b.rate;
  return rate;
}

export type SliceKind = "savings" | "benefits" | "tax" | "other" | "takeHome";

export interface PaycheckSlice {
  id: string;
  label: string;
  /** Yearly amount. */
  annual: number;
  kind: SliceKind;
  /** One short line on what this is. */
  note: string;
}

export interface PaycheckResult {
  gross: number;
  slices: PaycheckSlice[];
  takeHome: number;
  /** Amounts after the inputs were capped to the yearly limits. */
  used: {
    traditional403b: number;
    roth403b: number;
    traditional457b: number;
    hsa: number;
  };
  capped: {
    plan403b: boolean;
    plan457b: boolean;
    hsa: boolean;
    overPay: boolean;
  };
  federalTaxable: number;
  federalMarginal: number;
  /** All taxes (income and payroll) as a share of gross pay. */
  totalTaxRate: number;
}

const clampMoney = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computePaycheck(inputs: PaycheckInputs): PaycheckResult {
  const gross = clampMoney(inputs.salary);

  // Elective deferrals: 403(b)/401(k) traditional plus Roth share one limit; a 457(b) has its own
  // (IRS, "How much salary can you defer..."). Catch-up contributions for 50 and older are left out.
  let traditional403b = clampMoney(inputs.traditional403b);
  let roth403b = clampMoney(inputs.roth403b);
  const limit = DEFERRAL_LIMIT.amount;
  const plan403bCapped = traditional403b + roth403b > limit;
  if (plan403bCapped) {
    traditional403b = Math.min(traditional403b, limit);
    roth403b = Math.max(0, limit - traditional403b);
  }
  let traditional457b = clampMoney(inputs.traditional457b);
  const plan457bCapped = traditional457b > limit;
  traditional457b = Math.min(traditional457b, limit);

  let health = clampMoney(inputs.healthPremiumMonthly) * 12;
  // The family HSA limit is the most anyone under 55 can put in (Rev. Proc. 2025-19).
  const hsaCapped =
    clampMoney(inputs.hsaMonthly) * 12 > HSA_FAMILY_LIMIT.amount;
  let hsa = Math.min(
    clampMoney(inputs.hsaMonthly) * 12,
    HSA_FAMILY_LIMIT.amount,
  );
  let afterTax = clampMoney(inputs.afterTaxMonthly) * 12;

  // Never take out more than the person earns: scale the deductions down if they would.
  const deductions =
    traditional403b + roth403b + traditional457b + health + hsa + afterTax;
  const overPay = deductions > gross * 0.9;
  if (overPay && deductions > 0) {
    const scale = (gross * 0.9) / deductions;
    traditional403b *= scale;
    roth403b *= scale;
    traditional457b *= scale;
    health *= scale;
    hsa *= scale;
    afterTax *= scale;
  }

  // Section 125 (cafeteria plan) premiums and payroll HSA contributions skip both income tax and
  // FICA (Publication 15-B, Publication 969). Pretax retirement deferrals skip income tax but not
  // FICA (Topic 424).
  const ficaWages = Math.max(0, gross - health - hsa);
  const socialSecurity =
    Math.min(ficaWages, PAYROLL.socialSecurityWageBase) *
    PAYROLL.socialSecurityRate;
  const medicare =
    ficaWages * PAYROLL.medicareRate +
    Math.max(0, ficaWages - PAYROLL.additionalMedicareThreshold) *
      PAYROLL.additionalMedicareRate;

  const federalAgi = Math.max(
    0,
    gross - traditional403b - traditional457b - health - hsa,
  );
  const federalTaxable = Math.max(
    0,
    federalAgi - FEDERAL.standardDeduction[inputs.filing],
  );
  const federal = bracketTax(federalTaxable, FEDERAL.brackets[inputs.filing]);
  const state =
    inputs.state === "nm"
      ? bracketTax(federalTaxable, NEW_MEXICO.brackets[inputs.filing])
      : 0;

  const slices: PaycheckSlice[] = [
    {
      id: "traditional",
      label: "Pretax retirement",
      annual: traditional403b + traditional457b,
      kind: "savings",
      note: "403(b), 401(k) or 457(b). Still yours, but locked up for retirement.",
    },
    {
      id: "health",
      label: "Health insurance",
      annual: health,
      kind: "benefits",
      note: "Health, dental and vision premiums, taken out before tax.",
    },
    {
      id: "hsa",
      label: "HSA",
      annual: hsa,
      kind: "savings",
      note: "Health savings account. Still yours, for medical costs.",
    },
    {
      id: "socialSecurity",
      label: "Social Security",
      annual: socialSecurity,
      kind: "tax",
      note: `6.2% of pay, up to $${PAYROLL.socialSecurityWageBase.toLocaleString("en-US")} of wages in ${TAX_YEAR}.`,
    },
    {
      id: "medicare",
      label: "Medicare",
      annual: medicare,
      kind: "tax",
      note: "1.45% of all pay, plus 0.9% on wages over $200,000.",
    },
    {
      id: "federal",
      label: "Federal income tax",
      annual: federal,
      kind: "tax",
      note: `Estimated from ${TAX_YEAR} brackets after the standard deduction.`,
    },
    {
      id: "state",
      label: "New Mexico income tax",
      annual: state,
      kind: "tax",
      note: `Estimated from New Mexico's ${TAX_YEAR} brackets.`,
    },
    {
      id: "roth",
      label: "Roth retirement",
      annual: roth403b,
      kind: "savings",
      note: "Roth 403(b) or 401(k), taken out after tax.",
    },
    {
      id: "afterTax",
      label: "Other deductions",
      annual: afterTax,
      kind: "other",
      note: "After-tax deductions such as disability insurance or parking.",
    },
  ].filter(
    (s) => s.annual > 0.5 || s.id === "federal" || s.id === "socialSecurity",
  ) as PaycheckSlice[];

  const takeHome = Math.max(
    0,
    gross - slices.reduce((sum, s) => sum + s.annual, 0),
  );
  const taxes = socialSecurity + medicare + federal + state;

  return {
    gross,
    slices,
    takeHome,
    used: { traditional403b, roth403b, traditional457b, hsa },
    capped: {
      plan403b: plan403bCapped,
      plan457b: plan457bCapped,
      hsa: hsaCapped,
      overPay,
    },
    federalTaxable,
    federalMarginal: marginalRate(
      federalTaxable,
      FEDERAL.brackets[inputs.filing],
    ),
    totalTaxRate: gross > 0 ? taxes / gross : 0,
  };
}
