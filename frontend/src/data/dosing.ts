// Doses for the families' children's dose calculator (liquid acetaminophen and ibuprofen).
//
// Doses come from published weight-band charts, the same ranges printed on U.S. product
// labels, rather than from mg/kg math. Every answer therefore matches a chart a parent or
// pediatrician can look up. A band runs from its lowest weight up to the next band's start.

export type Medicine = "acetaminophen" | "ibuprofen";
export type ProductId = "tylenolLiquid" | "infantDrops" | "childrensLiquid";
export type WeightUnit = "lb" | "kg";

export interface MedicineInfo {
  name: string;
  every: string;
  limit: string;
}

export interface Product {
  medicine: Medicine;
  /** Shown above the weight box so the parent can match it to the bottle. */
  label: string;
  mgPerMl: number;
  /** The product isn't meant for children this heavy or heavier. */
  maxLb?: number;
  /** [lowest weight in pounds, dose in mL] */
  bands: [number, number][];
}

export const MEDICINES: Record<Medicine, MedicineInfo> = {
  acetaminophen: {
    name: "acetaminophen",
    every: "Every 4 to 6 hours as needed",
    limit: "Up to 5 doses in 24 hours",
  },
  ibuprofen: {
    name: "ibuprofen",
    every: "Every 6 to 8 hours as needed",
    limit: "Up to 4 doses in 24 hours",
  },
};

export const PRODUCTS: Record<ProductId, Product> = {
  // Infants' and Children's Tylenol liquids share one strength in the U.S., so one table covers both.
  tylenolLiquid: {
    medicine: "acetaminophen",
    label: "Tylenol liquid · 160 mg per 5 mL",
    mgPerMl: 32,
    bands: [[12, 2.5], [18, 3.75], [24, 5], [36, 7.5], [48, 10], [60, 12.5], [72, 15], [96, 20]],
  },
  infantDrops: {
    medicine: "ibuprofen",
    label: "Infants' ibuprofen drops · 50 mg per 1.25 mL",
    mgPerMl: 40,
    maxLb: 60,
    bands: [[12, 1.25], [18, 1.875], [24, 2.5], [36, 3.75], [48, 5]],
  },
  childrensLiquid: {
    medicine: "ibuprofen",
    label: "Children's ibuprofen · 100 mg per 5 mL",
    mgPerMl: 20,
    bands: [[12, 2.5], [18, 4], [24, 5], [36, 7.5], [48, 10], [60, 12.5], [72, 15], [96, 20]],
  },
};

/** Below this weight the calculator sends the family to their doctor. */
export const MIN_LB = 12;
/** Above this weight the number is treated as a typo. */
export const MAX_LB = 300;
export const LB_PER_KG = 2.2046226218;

export type DoseResult =
  | { status: "underweight" }
  | { status: "checkWeight" }
  | { status: "tooHeavyForProduct" }
  | { status: "ok"; ml: number; mg: number; lowLb: number; highLb: number | null };

export function toPounds(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value * LB_PER_KG : value;
}

export function doseFor(productId: ProductId, pounds: number): DoseResult {
  const product = PRODUCTS[productId];
  if (pounds < MIN_LB) return { status: "underweight" };
  if (pounds > MAX_LB) return { status: "checkWeight" };
  if (product.maxLb && pounds >= product.maxLb) return { status: "tooHeavyForProduct" };

  let i = product.bands.length - 1;
  while (i > 0 && pounds < product.bands[i][0]) i--;
  const [lowLb, ml] = product.bands[i];
  const next = product.bands[i + 1];
  const highLb = next ? next[0] - 1 : product.maxLb ? product.maxLb - 1 : null;
  return { status: "ok", ml, mg: Math.round(ml * product.mgPerMl), lowLb, highLb };
}

export const DOSING_SOURCES = [
  {
    title: "Children's Hospital Colorado: ibuprofen dose table",
    url: "https://www.childrenscolorado.org/conditions-and-advice/conditions-and-symptoms/dosagetables/pediatric/ibuprofen-motrin-advil-dose-table/",
  },
  {
    title: "Mayo Clinic: ibuprofen dosing guideline",
    url: "https://mcforms.mayo.edu/mc1400-mc1499/mc1492-06.pdf",
  },
  {
    title: "American Academy of Pediatrics acetaminophen chart (via WebMD)",
    url: "https://www.webmd.com/children/what-to-know-about-acetaminophen-dosing-in-infants-children",
  },
  {
    title: "Children's Tylenol Drug Facts label",
    url: "https://www.drugs.com/pro/children-s-tylenol-suspension.html",
  },
];
