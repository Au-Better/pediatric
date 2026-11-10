// Physicians (MD or DO), one entry per specialty.
//
// Which specialties: the eleven with the most first-year (PGY-1 and PGY-2 entry) residency
// positions in the 2026 NRMP Main Residency Match, plus neurological surgery, which Jake asked
// for by name. Source: NRMP, "Results and Data: 2026 Main Residency Match", Table 1A,
// https://www.nrmp.org/wp-content/uploads/2026/05/Main_Match_Results_and_Data-2026.pdf
// (positions offered: internal medicine 11,194; family medicine 5,491; emergency medicine 3,198;
// pediatrics 3,126; psychiatry 2,516; anesthesiology 1,865 + 306 PGY-2; surgery 1,807;
// obstetrics-gynecology 1,638; diagnostic radiology 156 + 1,083 PGY-2; neurology 1,003 + 233 PGY-2;
// orthopaedic surgery 963; neurological surgery 280). The counts are not shown on the page.
//
// Every physician shares the same road up to residency; only the residency, the board and
// the pay differ. Residency lengths are the ACGME minimums in each specialty's program
// requirements.

import type { Career, Cited, Pay, Step, YearRange } from "./types";

interface Specialty {
  id: string;
  name: string;
  alsoCalled?: string;
  about: string;
  aboutSources: Cited;
  residency: {
    years: YearRange;
    detail: string;
    varies?: string;
    sources: Cited;
  };
  board: string;
  boardSources: Cited;
  /** Subspecialty fellowship step, when the specialty has a specific source for it. */
  fellowship?: Step;
  pay?: Pay;
}

const beforeResidency: readonly Step[] = [
  {
    kind: "school",
    title: "Earn a bachelor's degree",
    years: [4, 4],
    detail:
      "Any major works. Each medical school sets its own required courses, which commonly include a year of biology and two years of chemistry through organic chemistry.",
    varies:
      "A few medical schools offer combined college and medical school programs that last 6 to 8 years in all.",
    sources: ["aamcRequirements", "blsPhysicians"],
  },
  {
    kind: "exam",
    title: "Take the MCAT",
    detail:
      "The Medical College Admission Test is a standardized, multiple-choice exam that every US medical school requires. Students take it before applying, through AMCAS for MD schools or AACOMAS for DO schools.",
    sources: ["aamcMCAT", "fsmbPathway"],
  },
  {
    kind: "school",
    title: "Go to medical school (MD or DO)",
    years: [4, 4],
    detail:
      "The first part is spent in classrooms and labs. In the second part, students work with patients under the supervision of experienced physicians.",
    varies:
      "There are two medical degrees, the MD and the DO, and both lead to the same residencies and licenses. DO schools add training in the musculoskeletal system and in osteopathic manipulative treatment, a hands-on way to diagnose and treat.",
    sources: ["blsPhysicians", "aacomOMT", "acgmeSingle", "nbomeComlex"],
  },
  {
    kind: "exam",
    title: "Pass the national licensing exams",
    detail:
      "MD students take the USMLE; DO students take COMLEX-USA and can take the USMLE too. The first parts come during medical school, and the last part (Step 3 or Level 3) is usually taken early in residency.",
    varies:
      "USMLE Step 1 and COMLEX Level 1 are now scored pass or fail; the later exams still give a number score.",
    sources: ["usmleBulletin", "nbomeComlex", "fsmbPathway", "usmleScoring", "nbomeScoring"],
  },
  {
    kind: "milestone",
    title: "Match into a residency",
    detail:
      "Near the end of medical school, students apply to residency programs and rank the ones they want, and programs rank the students. The National Resident Matching Program pairs them up, and students learn where they matched on Match Day in March.",
    sources: ["nrmpAlgorithm", "nrmpMatch2026", "fsmbPathway"],
  },
];

function afterResidency(specialty: Specialty): Step[] {
  return [
    {
      kind: "license",
      title: "Get a state medical license",
      detail:
        "State medical boards license physicians. Every state requires at least one year of residency first, and some require more.",
      sources: ["fsmbLicensure", "blsPhysicians"],
    },
    {
      kind: "exam",
      title: "Become board certified",
      detail: `After residency, physicians can take the certifying exam of the ${specialty.board}. Board certification is not required for a license, but it is a higher standard than a license alone.`,
      varies:
        "DO graduates can certify through either an ABMS member board or an American Osteopathic Association board.",
      sources: [...specialty.boardSources, "blsPhysicians", "abmsFAQ", "aoaBoards"],
    },
    specialty.fellowship ?? {
      kind: "training",
      title: "Fellowship to subspecialize",
      years: [1, 3],
      optional: true,
      detail:
        "Physicians who want to focus on one area of their specialty train for 1 to 3 more years in a fellowship.",
      sources: ["blsPhysicians", "acgmeFellowship"],
    },
  ];
}

function physician(s: Specialty): Career {
  return {
    id: s.id,
    name: s.name,
    alsoCalled: s.alsoCalled,
    family: "physician",
    credential: "MD or DO",
    about: s.about,
    aboutSources: s.aboutSources,
    steps: [
      ...beforeResidency,
      {
        kind: "training",
        title: `Residency in ${residencyName(s.name)}`,
        years: s.residency.years,
        detail: s.residency.detail,
        varies: s.residency.varies,
        sources: s.residency.sources,
      },
      ...afterResidency(s),
    ],
    pay: s.pay,
    outlook: {
      percent: 4,
      period: "2025–35",
      label: "As fast as average",
      occupation: "all physicians and surgeons",
      sources: ["blsPhysicians"],
    },
  };
}

function residencyName(careerName: string): string {
  return RESIDENCY_NAMES[careerName] ?? careerName.toLowerCase();
}

const RESIDENCY_NAMES: Record<string, string> = {
  Pediatrician: "pediatrics",
  "Family medicine physician": "family medicine",
  "Internal medicine physician": "internal medicine",
  "Emergency medicine physician": "emergency medicine",
  Psychiatrist: "psychiatry",
  "Obstetrician-gynecologist": "obstetrics and gynecology",
  "General surgeon": "general surgery",
  Anesthesiologist: "anesthesiology",
  Radiologist: "diagnostic radiology",
  Neurologist: "neurology",
  "Orthopaedic surgeon": "orthopaedic surgery",
  Neurosurgeon: "neurological surgery",
};

const blsPay = (median: number, occupation?: string): Pay => ({
  median,
  year: 2025,
  occupation,
  sources: ["blsPhysicians"],
});

export const physicians: Career[] = [
  physician({
    id: "pediatrician",
    name: "Pediatrician",
    about: "Pediatricians care for infants, children, teenagers and young adults.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [3, 3],
      detail: "Three years of training in the care of children, from newborns to young adults.",
      sources: ["acgmePeds"],
    },
    board: "American Board of Pediatrics",
    boardSources: ["abmsGuide"],
    fellowship: {
      kind: "training",
      title: "Fellowship to subspecialize",
      years: [2, 3],
      lengthLabel: "usually at least 3 years",
      optional: true,
      detail:
        "Pediatricians can go on to a subspecialty such as cardiology, neonatology or critical care. Most pediatric fellowships last at least three years.",
      varies: "Pediatric hospital medicine fellowships last two or three years, depending on the program.",
      sources: ["abpSubspecialties"],
    },
    pay: blsPay(210040, "general pediatricians"),
  }),
  physician({
    id: "family-medicine",
    name: "Family medicine physician",
    about:
      "Family medicine physicians are generalists who keep people of all ages healthy and treat the conditions that come up in everyday life.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [3, 3],
      detail: "Three years of training in primary care for all ages.",
      sources: ["acgmeFM"],
    },
    board: "American Board of Family Medicine",
    boardSources: ["abmsGuide"],
    pay: blsPay(244180),
  }),
  physician({
    id: "internal-medicine",
    name: "Internal medicine physician",
    alsoCalled: "internist",
    about:
      "Internists diagnose and treat, without surgery, a wide range of problems that affect adults' internal organs and body systems.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [3, 3],
      detail: "Three years of training in the care of adults.",
      sources: ["acgmeIM"],
    },
    board: "American Board of Internal Medicine",
    boardSources: ["abmsGuide"],
    pay: blsPay(256560, "general internal medicine physicians"),
  }),
  physician({
    id: "emergency-medicine",
    name: "Emergency medicine physician",
    about: "Emergency physicians treat patients in urgent medical situations.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [3, 4],
      detail: "Three or four years of training, depending on the program.",
      varies: "Emergency medicine programs come in 3-year and 4-year formats.",
      sources: ["acgmeEM"],
    },
    board: "American Board of Emergency Medicine",
    boardSources: ["abmsGuide"],
    pay: blsPay(335550),
  }),
  physician({
    id: "psychiatrist",
    name: "Psychiatrist",
    about: "Psychiatrists are physicians who evaluate and treat mental, addictive and emotional disorders.",
    aboutSources: ["abmsGuide", "blsPhysicians"],
    residency: { years: [4, 4], detail: "Four years of training in psychiatry.", sources: ["acgmePsych"] },
    board: "American Board of Psychiatry and Neurology",
    boardSources: ["abmsGuide"],
    pay: blsPay(281870),
  }),
  physician({
    id: "obstetrician-gynecologist",
    name: "Obstetrician-gynecologist",
    alsoCalled: "OB-GYN",
    about:
      "OB-GYNs care for women through pregnancy and childbirth and treat conditions of the female reproductive system.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [4, 4],
      detail: "Four years of training in obstetrics and gynecology, including surgery.",
      sources: ["acgmeOBGYN"],
    },
    board: "American Board of Obstetrics and Gynecology",
    boardSources: ["abmsGuide"],
    pay: blsPay(292910, "obstetricians and gynecologists"),
  }),
  physician({
    id: "general-surgeon",
    name: "General surgeon",
    about: "Surgeons operate on patients to treat disease and injuries and to repair tissues and organs.",
    aboutSources: ["abmsGuide", "blsPhysicians"],
    residency: { years: [5, 5], detail: "Five years of training in surgery.", sources: ["acgmeSurgery"] },
    board: "American Board of Surgery",
    boardSources: ["abmsGuide"],
    pay: blsPay(414010, "the BLS group “surgeons, all other”"),
  }),
  physician({
    id: "anesthesiologist",
    name: "Anesthesiologist",
    about: "Anesthesiologists care for patients having surgery and specialize in relieving pain.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [4, 4],
      detail: "Four years in all: one year of general clinical training, then three years of anesthesiology.",
      varies:
        "Some programs include the first clinical year; others start after a separate first year of clinical training.",
      sources: ["acgmeAnes"],
    },
    board: "American Board of Anesthesiology",
    boardSources: ["abmsGuide"],
    pay: blsPay(391490, "anesthesiologists"),
  }),
  physician({
    id: "radiologist",
    name: "Radiologist",
    about: "Radiologists read x-rays, ultrasounds and other medical images to find injuries and diseases.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [5, 5],
      detail:
        "Five years in all: one year of clinical training with patients, then four years of diagnostic radiology.",
      varies:
        "Some programs include the first clinical year; others start after a separate first year of clinical training.",
      sources: ["acgmeRad", "abmsGuide"],
    },
    board: "American Board of Radiology",
    boardSources: ["abmsGuide"],
    pay: blsPay(420860, "radiologists"),
  }),
  physician({
    id: "neurologist",
    name: "Neurologist",
    about: "Neurologists diagnose and treat disorders of the brain and nervous system.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [4, 4],
      detail: "Four years in all: one year of internal medicine, then three years of neurology.",
      varies:
        "Some programs include the first year; others start after a separate first year of internal medicine.",
      sources: ["acgmeNeuro"],
    },
    board: "American Board of Psychiatry and Neurology",
    boardSources: ["abmsGuide"],
    pay: blsPay(248560, "neurologists"),
  }),
  physician({
    id: "orthopaedic-surgeon",
    name: "Orthopaedic surgeon",
    alsoCalled: "orthopedic surgeon",
    about:
      "Orthopaedic surgeons diagnose and treat conditions and injuries of the bones, joints and muscles.",
    aboutSources: ["blsPhysicians"],
    residency: {
      years: [5, 5],
      detail: "Five years of training in orthopaedic surgery.",
      sources: ["acgmeOrtho"],
    },
    board: "American Board of Orthopaedic Surgery",
    boardSources: ["abmsGuide"],
    pay: blsPay(358550, "orthopedic surgeons, except pediatric"),
  }),
  physician({
    id: "neurosurgeon",
    name: "Neurosurgeon",
    alsoCalled: "neurological surgeon",
    about:
      "Neurosurgeons treat conditions of the brain, spine and nerves in children and adults, often with surgery.",
    aboutSources: ["abmsGuide"],
    residency: {
      years: [7, 7],
      detail: "Seven years of training in neurological surgery, the longest residency on this page.",
      sources: ["acgmeNSGY"],
    },
    board: "American Board of Neurological Surgery",
    boardSources: ["abmsGuide"],
    pay: blsPay(414010, "the BLS group “surgeons, all other”"),
  }),
];
