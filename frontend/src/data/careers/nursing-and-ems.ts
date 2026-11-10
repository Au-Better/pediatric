// Registered nurses, nurse practitioners and emergency medical technicians (EMTs).
// Every fact names its source; see sources.ts for the pages and the day each was read.

import type { Career } from "./types";

export const registeredNurse: Career = {
  id: "registered-nurse",
  name: "Registered nurse",
  alsoCalled: "RN",
  family: "nursing",
  credential: "RN",
  about:
    "Registered nurses provide and coordinate patient care and teach patients and the public about health conditions.",
  aboutSources: ["blsRN"],
  steps: [
    {
      kind: "school",
      title: "Finish a nursing program (BSN or ADN)",
      years: [3, 4],
      detail:
        "Most RNs earn a bachelor of science in nursing (BSN) or an associate degree in nursing (ADN). Every program includes supervised clinical experience with patients.",
      varies:
        "A BSN typically takes 4 years. AACN describes the ADN as a 3-year community college degree, while BLS says ADN programs also typically take 4 years to complete. Diploma programs, usually run by hospitals, take 2 to 3 years. If you already have a bachelor's degree in another field, an accelerated BSN takes 12 to 18 months. Some employers, especially hospitals, may require a BSN, and RNs with an ADN can finish one later in an RN-to-BSN program.",
      sources: ["blsRN", "aacnEducationImpact", "aacnAccelerated", "aacnDegreeCompletion"],
    },
    {
      kind: "exam",
      title: "Pass the NCLEX",
      detail:
        "The national nursing licensure exam from NCSBN. Its current version, the Next Generation NCLEX, began in April 2023 and is built to measure clinical judgment and decision making.",
      sources: ["ncsbnNGN", "nclexNGN", "blsRN"],
    },
    {
      kind: "license",
      title: "Get a state nursing license",
      detail:
        "RNs need a license from the state where they work. In states that belong to the Nurse Licensure Compact, one multistate license lets a nurse practice in every compact state.",
      sources: ["blsRN", "nlc"],
    },
    {
      kind: "exam",
      title: "Earn a specialty certification",
      optional: true,
      detail:
        "Certification in a specialty area is usually voluntary. Employers may require certifications such as CPR, basic life support or advanced cardiac life support.",
      sources: ["blsRN"],
    },
  ],
  pay: { median: 97550, year: 2025, sources: ["blsRN"] },
  outlook: { percent: 6, period: "2025–35", label: "Faster than average", sources: ["blsRN"] },
};

export const nursePractitioner: Career = {
  id: "nurse-practitioner",
  name: "Nurse practitioner",
  alsoCalled: "NP",
  family: "nursing",
  credential: "APRN",
  about:
    "Nurse practitioners are advanced practice nurses who serve as primary and specialty care providers for patients and their families.",
  aboutSources: ["blsNP"],
  steps: [
    {
      kind: "school",
      title: "Earn a bachelor's degree in nursing (BSN)",
      years: [4, 4],
      detail: "Most nurse practitioner programs prefer applicants who have a BSN.",
      varies:
        "Bridge programs let registered nurses with an associate degree or a diploma move on to NP education.",
      sources: ["blsNP", "blsRN"],
    },
    {
      kind: "license",
      title: "Pass the NCLEX and become a registered nurse",
      detail: "A nurse must hold an RN license before starting education in an advanced practice role.",
      sources: ["blsNP"],
    },
    {
      kind: "school",
      title: "Earn a master's (MSN) or doctorate (DNP) as a nurse practitioner",
      years: [1.5, 2],
      lengthLabel: "18–24 months (master's)",
      detail:
        "NPs train in a population focus: family (all ages), adult-gerontology, pediatrics, neonatal, women's health or psychiatric-mental health. The certification boards for family and pediatric NPs, for example, require at least 500 hours of supervised clinical practice.",
      varies:
        "The time shown is for a full-time master's. Nursing education groups recommend the doctorate (DNP) for new NPs and more schools now offer it, but a master's still qualifies for national certification. Some RNs with an associate degree enter RN-to-MSN programs, which take about 2 to 3 years.",
      sources: ["aacnMasters", "aacnDNP", "aprnConsensus", "anccFNP", "pncbPC", "blsNP"],
    },
    {
      kind: "exam",
      title: "Pass a national certification exam",
      detail:
        "The exam matches the population focus, for example from AANPCB or ANCC for family NPs, or from PNCB for pediatric NPs.",
      sources: ["blsNP", "aanpcbCertify", "anccFNP", "pncbPC"],
    },
    {
      kind: "license",
      title: "Get a state license as an advanced practice nurse",
      detail:
        "In more than half of states and territories, NPs have full practice authority: they can evaluate, diagnose, treat and prescribe under their own nursing license. Other states require a collaborative agreement with, or supervision by, another provider.",
      sources: ["aanpPractice", "aanpFPABrief"],
    },
  ],
  pay: { median: 132300, year: 2025, sources: ["blsNP"] },
  outlook: { percent: 41, period: "2025–35", sources: ["blsNP"] },
};

export const emt: Career = {
  id: "emt",
  name: "Emergency medical technician",
  alsoCalled: "EMT",
  family: "ems",
  credential: "NREMT",
  about:
    "EMTs assess injuries and illnesses, give emergency medical care and may take patients to the hospital.",
  aboutSources: ["blsEMT"],
  steps: [
    {
      kind: "milestone",
      title: "Prepare in high school",
      detail:
        "Take life science courses and consider getting certified in CPR. Some high schools offer EMT training through career and technical programs.",
      sources: ["blsEMT"],
    },
    {
      kind: "school",
      title: "Complete a state-approved EMT course",
      years: [0, 1],
      lengthLabel: "less than 1 year",
      detail:
        "Most programs ask for a high school diploma or equivalent and certification in CPR and basic life support. They usually end with a certificate, not a degree.",
      varies: "Course length differs by program and by state.",
      sources: ["blsEMT", "nremtEMT"],
    },
    {
      kind: "exam",
      title: "Pass the National Registry exams",
      detail:
        "Certification from the National Registry of EMTs takes a knowledge exam and a hands-on skills exam approved by your state.",
      sources: ["nremtScheme", "nremtEMT"],
    },
    {
      kind: "license",
      title: "Get a state license",
      detail:
        "Every state licenses EMTs. Most states require National Registry certification; others give their own exam. States may also require a background check.",
      varies: "The National Registry has no minimum age, but states may set one.",
      sources: ["blsEMT", "nremtAge"],
    },
    {
      kind: "training",
      title: "Advance to AEMT or paramedic",
      optional: true,
      detail:
        "With EMT experience you can train for higher levels. Paramedics give more advanced care than EMTs. National Registry paramedic certification requires an accredited program; these lead to a certificate or an associate degree, and some universities offer a bachelor's degree.",
      sources: ["blsEMT", "nremtParamedic", "emsScope"],
    },
    {
      kind: "milestone",
      title: "Renew every two years",
      detail: "National Registry EMTs renew every two years, with 40 hours of continuing education.",
      sources: ["nremtScheme"],
    },
  ],
  totalLabel: "Less than 1 year",
  pay: { median: 44470, year: 2025, occupation: "EMTs", sources: ["blsEMT"] },
  outlook: {
    percent: 6,
    period: "2025–35",
    label: "Faster than average",
    occupation: "EMTs and paramedics",
    sources: ["blsEMT"],
  },
};
