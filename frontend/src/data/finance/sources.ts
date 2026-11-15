// Every page the clinician finance section rests on, with the day it was read.
// To add a fact, add (or reuse) a source here and name its id where the fact is used.
// The build fails if a source id is misspelled, because SourceId is checked by TypeScript.

export interface FinanceSource {
  publisher: string;
  title: string;
  url: string;
  /** The day the page was read, as YYYY-MM-DD. */
  accessed: string;
}

const READ = "2026-11-15";

export const financeSources = {
  // Federal income tax, 2026
  irsTax2026: {
    publisher: "IRS",
    title:
      "IRS releases tax inflation adjustments for tax year 2026, including amendments from the One, Big, Beautiful Bill (IR-2025-103, Rev. Proc. 2025-32)",
    url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    accessed: READ,
  },
  // Payroll taxes
  irsTc751: {
    publisher: "IRS",
    title: "Topic no. 751, Social Security and Medicare withholding rates",
    url: "https://www.irs.gov/taxtopics/tc751",
    accessed: READ,
  },
  ssaWageBase2026: {
    publisher: "Social Security Administration (Federal Register)",
    title:
      "Cost-of-Living Increase and Other Determinations for 2026 (Nov. 3, 2025)",
    url: "https://www.govinfo.gov/content/pkg/FR-2025-11-03/pdf/2025-19763.pdf",
    accessed: READ,
  },
  irsTc424: {
    publisher: "IRS",
    title: "Topic no. 424, 401(k) plans",
    url: "https://www.irs.gov/taxtopics/tc424",
    accessed: READ,
  },
  irsP15b: {
    publisher: "IRS",
    title: "Publication 15-B, Employer's Tax Guide to Fringe Benefits",
    url: "https://www.irs.gov/publications/p15b",
    accessed: READ,
  },
  // New Mexico
  nmHB252: {
    publisher: "New Mexico Legislature",
    title:
      "House Bill 252 (2024), personal income tax rates for taxable years from Jan. 1, 2025",
    url: "https://www.nmlegis.gov/Sessions/24%20Regular/bills/house/HB0252.pdf",
    accessed: READ,
  },
  nmConformity: {
    publisher:
      "New Mexico Legislature (Taxation and Revenue Dept. and LFC presentation)",
    title:
      "One Big Beautiful Bill Act: tax provisions and New Mexico conformity (July 2025)",
    url: "https://www.nmlegis.gov/handouts/ZFFSS%20073125%20Item%203%20OBBBA%20Tax%20Presentation.pdf",
    accessed: READ,
  },
  // Pay examples
  amaResidentPay: {
    publisher:
      "American Medical Association (reporting the AAMC 2025 stipend survey)",
    title: "Resident physician pay still rising, but growth trails inflation",
    url: "https://www.ama-assn.org/medical-residents/residency-life/resident-physician-pay-still-rising-growth-trails-inflation",
    accessed: READ,
  },
  blsPhysicians: {
    publisher: "US Bureau of Labor Statistics",
    title:
      "Physicians and Surgeons (Occupational Outlook Handbook), pay as of May 2025",
    url: "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm",
    accessed: READ,
  },
  // Retirement limits
  irsLimits2026: {
    publisher: "IRS",
    title:
      "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500 (IR-2025-111)",
    url: "https://www.irs.gov/node/152316",
    accessed: READ,
  },
  irsNotice202567: {
    publisher: "IRS",
    title:
      "Notice 2025-67, 2026 limitations adjusted as provided in section 415(d), etc.",
    url: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf",
    accessed: READ,
  },
  irsLimits2027: {
    publisher: "IRS",
    title:
      "401(k) limit increases to $25,500 for 2027, IRA limit remains $7,500 (IR-2026-136)",
    url: "https://www.irs.gov/newsroom/401k-limit-increases-to-25500-for-2027-ira-limit-remains-7500",
    accessed: READ,
  },
  irsNotice202666: {
    publisher: "IRS",
    title:
      "Notice 2026-66, 2027 limitations adjusted as provided in section 415(d), etc.",
    url: "https://www.irs.gov/pub/irs-drop/n-26-66.pdf",
    accessed: READ,
  },
  irsHsa2026: {
    publisher: "IRS",
    title:
      "Rev. Proc. 2025-19, 2026 inflation-adjusted amounts for health savings accounts",
    url: "https://www.irs.gov/pub/irs-drop/rp-25-19.pdf",
    accessed: READ,
  },
  irsHsa2027: {
    publisher: "IRS",
    title:
      "Rev. Proc. 2026-24, 2027 inflation-adjusted amounts for health savings accounts",
    url: "https://www.irs.gov/pub/irs-drop/rp-26-24.pdf",
    accessed: READ,
  },
  irsP969: {
    publisher: "IRS",
    title:
      "Publication 969, Health Savings Accounts and Other Tax-Favored Health Plans",
    url: "https://www.irs.gov/publications/p969",
    accessed: READ,
  },
  irs457Separate: {
    publisher: "IRS",
    title:
      "How much salary can you defer if you're eligible for more than one retirement plan?",
    url: "https://www.irs.gov/retirement-plans/how-much-salary-can-you-defer-if-youre-eligible-for-more-than-one-retirement-plan",
    accessed: READ,
  },
  irsNonGov457: {
    publisher: "IRS",
    title: "Non-governmental 457(b) deferred compensation plans",
    url: "https://www.irs.gov/retirement-plans/non-governmental-457b-deferred-compensation-plans",
    accessed: READ,
  },
  irsP5036: {
    publisher: "IRS",
    title:
      "Publication 5036, Retirement Plan Distributions: Exceptions to 10% Additional Tax",
    url: "https://www.irs.gov/pub/irs-pdf/p5036.pdf",
    accessed: READ,
  },
  irsRolloverChart: {
    publisher: "IRS",
    title: "Rollover chart",
    url: "https://www.irs.gov/pub/irs-tege/rollover_chart.pdf",
    accessed: READ,
  },
  irsI8606: {
    publisher: "IRS",
    title: "Instructions for Form 8606, Nondeductible IRAs",
    url: "https://www.irs.gov/instructions/i8606",
    accessed: READ,
  },
  // Bank accounts
  irsTc403: {
    publisher: "IRS",
    title: "Topic no. 403, Interest received",
    url: "https://www.irs.gov/taxtopics/tc403",
    accessed: READ,
  },
  irs1099int: {
    publisher: "IRS",
    title: "Form 1099-INT, Interest Income (instructions for recipient)",
    url: "https://www.irs.gov/pub/irs-pdf/f1099int.pdf",
    accessed: READ,
  },
  irsP550: {
    publisher: "IRS",
    title: "Publication 550, Investment Income and Expenses",
    url: "https://www.irs.gov/publications/p550",
    accessed: READ,
  },
  fdic: {
    publisher: "FDIC",
    title: "Deposit Insurance",
    url: "https://www.fdic.gov/resources/deposit-insurance",
    accessed: READ,
  },
  fdicCovered: {
    publisher: "FDIC",
    title: "Understanding Deposit Insurance",
    url: "https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance",
    accessed: READ,
  },
  ncua: {
    publisher: "NCUA",
    title: "Share Insurance Coverage",
    url: "https://ncua.gov/consumers/share-insurance-coverage",
    accessed: READ,
  },
  fedRegD: {
    publisher: "Federal Reserve Board",
    title: "Savings Deposits Frequently Asked Questions",
    url: "https://www.federalreserve.gov/supervisionreg/savings-deposits-frequently-asked-questions.htm",
    accessed: READ,
  },
  // Credit cards (each issuer's own page)
  chaseSapphirePreferred: {
    publisher: "Chase",
    title: "Chase Sapphire Preferred Credit Card",
    url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
    accessed: READ,
  },
  chaseSapphireReserve: {
    publisher: "Chase",
    title: "Chase Sapphire Reserve Credit Card",
    url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve",
    accessed: READ,
  },
  chaseFreedomUnlimited: {
    publisher: "Chase",
    title: "Chase Freedom Unlimited Credit Card",
    url: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
    accessed: READ,
  },
  amexPlatinum: {
    publisher: "American Express",
    title: "The Platinum Card",
    url: "https://www.americanexpress.com/us/credit-cards/card/platinum/",
    accessed: READ,
  },
  amexGold: {
    publisher: "American Express",
    title: "The American Express Gold Card",
    url: "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
    accessed: READ,
  },
  capitalOneVentureX: {
    publisher: "Capital One",
    title: "All About the Capital One Venture X Card",
    url: "https://www.capitalone.com/learn-grow/more-than-money/all-about-venture-x/",
    accessed: READ,
  },
  citiDoubleCash: {
    publisher: "Citi",
    title: "Citi Double Cash Credit Card",
    url: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
    accessed: READ,
  },
  bilt: {
    publisher: "Bilt",
    title: "Bilt Credit Cards (Blue, Obsidian, Palladium)",
    url: "https://www.bilt.com/card",
    accessed: READ,
  },
} satisfies Record<string, FinanceSource>;

export type FinanceSourceId = keyof typeof financeSources;

/** At least one source wherever a fact is stated. */
export type FinanceCited = readonly [FinanceSourceId, ...FinanceSourceId[]];
