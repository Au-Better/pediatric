// Credit cards for the clinician finance section.
//
// Every fact here was read on the issuer's own page on the date in `checked`. Cards change their
// fees, earn rates and credits often, so:
// - update a card by reading its issuer page again and changing its entry and `checked` date;
// - remove a card by deleting its entry; add one by copying an entry.
// Welcome offers are left out on purpose: they change every few weeks and often differ by person.
// Au Better earns nothing from these cards, and the links go to the issuers' own pages.

import type { FinanceSourceId } from "./sources";

export type CardType = "travel" | "cashBack" | "rent";

export interface CardCredit {
  label: string;
  /** The most the credit can be worth in a year, in dollars, as the issuer states it. */
  yearly: number;
  /** How it is paid out or what it is limited to. */
  detail: string;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  type: CardType;
  annualFee: number;
  /** Earn rates, best first, in the issuer's words where possible. */
  earn: string[];
  /** Statement credits with a stated dollar value. A visitor ticks the ones they'd use. */
  credits: CardCredit[];
  /** Other perks with no stated dollar value, or whose value depends on use. */
  perks: string[];
  /** Foreign transaction fee as the issuer's card page states it, or null if the page doesn't say. */
  foreignFee: string | null;
  /** One line on who tends to get the most out of it. */
  goodFit: string;
  /** Anything a reader should know before applying. */
  watchOut?: string;
  source: FinanceSourceId;
  /** The day the issuer's page was read, as YYYY-MM-DD. */
  checked: string;
}

const CHECKED = "2026-11-15";

/** The Global Entry, TSA PreCheck or NEXUS credit is $120 once every 4 years, so $30 a year. */
const TRUSTED_TRAVELER = {
  label: "Global Entry or TSA PreCheck",
  yearly: 30,
  detail: "$120 once every 4 years",
};

export const CARDS: CreditCard[] = [
  {
    id: "chase-sapphire-preferred",
    name: "Chase Sapphire Preferred",
    issuer: "Chase",
    type: "travel",
    annualFee: 95,
    earn: [
      "5x points on travel booked through Chase Travel",
      "3x on dining, including takeout and eligible delivery",
      "3x on gas and EV charging",
      "3x on vacation homes at top brands like Airbnb and Vrbo",
      "3x on online groceries (not Target, Walmart or wholesale clubs)",
      "3x on top streaming services",
      "2x on other travel",
      "1x on everything else",
    ],
    credits: [
      {
        label: "Chase Travel hotel credit",
        yearly: 100,
        detail:
          "Hotel stays booked through Chase Travel, each account anniversary year",
      },
      TRUSTED_TRAVELER,
    ],
    perks: [
      "Points move to airline and hotel partners such as United, Southwest, Air Canada Aeroplan, World of Hyatt and Marriott",
      "Points can be worth up to 1.5x on select hotels and flights through Chase Travel (Points Boost)",
    ],
    foreignFee: "None",
    goodFit: "A first travel card. The fee is low and dining earns 3x.",
    source: "chaseSapphirePreferred",
    checked: CHECKED,
  },
  {
    id: "chase-sapphire-reserve",
    name: "Chase Sapphire Reserve",
    issuer: "Chase",
    type: "travel",
    annualFee: 795,
    earn: [
      "8x points on Chase Travel, including The Edit hotels",
      "4x on flights booked directly with airlines",
      "4x on hotels booked directly with hotels",
      "3x on dining",
      "1x on everything else",
    ],
    credits: [
      {
        label: "Travel credit",
        yearly: 300,
        detail: "Any travel, each account anniversary year",
      },
      {
        label: "The Edit hotel credit",
        yearly: 500,
        detail:
          "$250 per prepaid stay of 2 nights or more, through Chase Travel",
      },
      {
        label: "Dining credit",
        yearly: 300,
        detail: "$150 each half year at OpenTable Exclusive Tables restaurants",
      },
      {
        label: "StubHub and viagogo credit",
        yearly: 300,
        detail: "Through Dec 31, 2027; must be activated",
      },
      {
        label: "Lyft credit",
        yearly: 120,
        detail: "$10 a month, through Sept 30, 2027",
      },
      {
        label: "Peloton credit",
        yearly: 120,
        detail: "$10 a month, through Dec 31, 2027; must be activated",
      },
      TRUSTED_TRAVELER,
    ],
    perks: [
      "Lounge access: Chase Sapphire Lounges and Priority Pass lounges, with two guests",
      "DoorDash DashPass membership and monthly DoorDash promos",
      "Apple TV and Apple Music subscriptions (must be activated)",
      "Points can be worth up to 2x on select hotels and flights through Chase Travel (Points Boost)",
    ],
    foreignFee: "None",
    goodFit:
      "Frequent travelers who will really use the travel credit and the lounges.",
    watchOut:
      "Authorized users cost $195 each. Most of the fee comes back only if you use the credits.",
    source: "chaseSapphireReserve",
    checked: CHECKED,
  },
  {
    id: "amex-platinum",
    name: "The Platinum Card",
    issuer: "American Express",
    type: "travel",
    annualFee: 895,
    earn: [
      "5x points on flights booked directly with airlines or through Amex Travel (up to $500,000 a year)",
      "5x on prepaid hotels booked through Amex Travel",
      "1x on everything else",
    ],
    credits: [
      {
        label: "Hotel credit",
        yearly: 600,
        detail:
          "Up to $300 each half year on prepaid Fine Hotels + Resorts or The Hotel Collection stays",
      },
      {
        label: "Resy dining credit",
        yearly: 400,
        detail: "Up to $100 each quarter",
      },
      {
        label: "Digital entertainment credit",
        yearly: 300,
        detail: "Up to $25 a month",
      },
      {
        label: "lululemon credit",
        yearly: 300,
        detail: "Up to $75 each quarter",
      },
      {
        label: "Uber Cash",
        yearly: 200,
        detail: "$15 a month, plus $20 in December",
      },
      {
        label: "Airline fee credit",
        yearly: 200,
        detail: "Incidental fees on one airline you pick",
      },
      { label: "CLEAR+ credit", yearly: 219, detail: "Each calendar year" },
      { label: "Oura Ring credit", yearly: 200, detail: "Each calendar year" },
      { label: "Walmart+ credit", yearly: 155, detail: "Up to $12.95 a month" },
      { label: "Uber One credit", yearly: 120, detail: "Each year" },
      TRUSTED_TRAVELER,
    ],
    perks: [
      "Lounge access: Centurion Lounges, Priority Pass, and 10 Delta Sky Club visits a year on Delta flights",
    ],
    foreignFee: "None",
    goodFit:
      "People who fly often and will use most of the monthly and quarterly credits.",
    watchOut:
      "The highest fee on this list. Many credits come in small monthly or quarterly pieces, so they're easy to miss.",
    source: "amexPlatinum",
    checked: CHECKED,
  },
  {
    id: "amex-gold",
    name: "American Express Gold Card",
    issuer: "American Express",
    type: "travel",
    annualFee: 325,
    earn: [
      "4x points at restaurants worldwide (up to $50,000 a year, then 1x)",
      "4x at US supermarkets (up to $25,000 a year, then 1x)",
      "5x on prepaid hotels booked through Amex Travel",
      "3x on flights booked directly with airlines or through Amex Travel",
      "1x on everything else",
    ],
    credits: [
      { label: "Uber Cash", yearly: 120, detail: "$10 a month" },
      {
        label: "Dining credit",
        yearly: 120,
        detail: "Up to $10 a month; enrollment required",
      },
      {
        label: "Resy credit",
        yearly: 100,
        detail:
          "Up to $50 each half year at US Resy restaurants; enrollment required",
      },
      {
        label: "Dunkin' credit",
        yearly: 84,
        detail: "Up to $7 a month at US Dunkin'; enrollment required",
      },
    ],
    perks: [],
    foreignFee: "None",
    goodFit: "Households that spend a lot on groceries and eating out.",
    source: "amexGold",
    checked: CHECKED,
  },
  {
    id: "capital-one-venture-x",
    name: "Capital One Venture X",
    issuer: "Capital One",
    type: "travel",
    annualFee: 395,
    earn: [
      "10x miles on hotels and rental cars booked through Capital One Travel",
      "5x on flights and vacation rentals booked through Capital One Travel",
      "2x on everything else",
    ],
    credits: [
      {
        label: "Capital One Travel credit",
        yearly: 300,
        detail: "Bookings through Capital One Travel, each year",
      },
    ],
    perks: [
      "10,000 bonus miles every year, starting at the first anniversary",
      "Lounge access: Capital One Lounges and Landings, and Priority Pass lounges after enrollment",
    ],
    foreignFee: "None",
    goodFit:
      "People who want 2x on everything and will book one trip a year through Capital One Travel.",
    source: "capitalOneVentureX",
    checked: CHECKED,
  },
  {
    id: "chase-freedom-unlimited",
    name: "Chase Freedom Unlimited",
    issuer: "Chase",
    type: "cashBack",
    annualFee: 0,
    earn: [
      "5% on travel booked through Chase Travel",
      "3% on dining, including takeout and eligible delivery",
      "3% at drugstores",
      "1.5% on everything else",
    ],
    credits: [],
    perks: [
      "0% intro APR on purchases and balance transfers for 15 months (a balance transfer fee applies)",
    ],
    foreignFee: null,
    goodFit:
      "A no-fee everyday card with extra cash back on dining and drugstores.",
    source: "chaseFreedomUnlimited",
    checked: CHECKED,
  },
  {
    id: "citi-double-cash",
    name: "Citi Double Cash",
    issuer: "Citi",
    type: "cashBack",
    annualFee: 0,
    earn: [
      "2% on everything: 1% when you buy and 1% as you pay",
      "5% in total on hotels, car rentals and attractions booked through Citi Travel",
    ],
    credits: [],
    perks: [],
    foreignFee:
      "Yes, a percentage of each purchase (see Citi's pricing for the rate)",
    goodFit: "Simple flat cash back with no categories to track.",
    watchOut:
      "Not for spending abroad, because it charges a foreign transaction fee.",
    source: "citiDoubleCash",
    checked: CHECKED,
  },
  {
    id: "bilt-blue",
    name: "Bilt Blue Card",
    issuer: "Bilt (issued by Column N.A., serviced by Cardless)",
    type: "rent",
    annualFee: 0,
    earn: [
      "Points on rent or mortgage with no transaction fee: up to 1.25x, depending on how much else you spend on the card",
      "3x on hotels and 2x on flights booked through Bilt Travel",
      "1x on everything else",
    ],
    credits: [],
    perks: [
      "Housing points depend on everyday spending each billing cycle: 25% of your housing payment earns 0.5x, 50% earns 0.75x, 75% earns 1x, 100% or more earns 1.25x",
      "Two other Bilt cards add more rewards: Obsidian ($95 a year) and Palladium ($495 a year)",
    ],
    foreignFee: "None",
    goodFit:
      "Renters and homeowners who want points on their biggest monthly bill.",
    watchOut:
      "The housing rate depends on other spending on the card, so check the rules on Bilt's page.",
    source: "bilt",
    checked: CHECKED,
  },
];

export const CARD_TYPE_LABEL: Record<CardType, string> = {
  travel: "Travel",
  cashBack: "Cash back",
  rent: "Rent and mortgage",
};
