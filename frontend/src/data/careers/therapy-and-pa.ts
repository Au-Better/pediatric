// Physician associates (PAs), occupational therapists and speech-language pathologists.
// Every fact names its source; see sources.ts for the pages and the day each was read.

import type { Career } from "./types";

export const physicianAssociate: Career = {
  id: "physician-associate",
  name: "Physician associate (PA)",
  alsoCalled: "physician assistant",
  family: "pa",
  credential: "PA-C",
  about:
    "PAs examine, diagnose and treat patients, working on teams with physicians, surgeons and other health care workers.",
  aboutSources: ["blsPA"],
  note: {
    text: "In 2021 the American Academy of Physician Associates voted to change the title from physician assistant to physician associate. As of April 2026, four states (Oregon, Maine, New Hampshire and Iowa) had made the change in law; most state laws still say physician assistant, and the credential is still PA-C.",
    sources: ["aapaTitleVote", "aapaTitleIowa", "nccpaBecome"],
  },
  steps: [
    {
      kind: "school",
      title: "Earn a bachelor's degree",
      years: [4, 4],
      detail:
        "Any major works if you take the science courses PA programs ask for. Most programs require chemistry, biology, anatomy, physiology and microbiology.",
      varies:
        "Each PA program sets its own prerequisites, so look up the programs you like early, even in high school.",
      sources: ["nccpaHighSchool", "aapaBecome"],
    },
    {
      kind: "milestone",
      title: "Get hands-on patient care experience",
      detail:
        "Many PA programs require hands-on health care experience before you apply, for example as an EMT, paramedic or medical assistant.",
      varies:
        "How many hours programs want differs. NCCPA's guide for high school students says to plan on at least 1,000 hours.",
      sources: ["aapaBecome", "blsPA", "nccpaHighSchool"],
    },
    {
      kind: "school",
      title: "Finish an accredited PA program (master's degree)",
      years: [2, 2.25],
      lengthLabel: "23–27 months",
      detail:
        "Most students apply through one central application, CASPA. PA school mixes classroom science with at least 2,000 hours of clinical rotations, including family medicine, emergency medicine, internal medicine, surgery, pediatrics, women's health and behavioral health.",
      sources: ["nccpaHighSchool", "arcpaStandards"],
    },
    {
      kind: "exam",
      title: "Pass the PANCE",
      detail:
        "The Physician Assistant National Certifying Exam, given by NCCPA, is open to graduates of ARC-PA accredited programs. Passing it earns the PA-C credential.",
      sources: ["nccpaBecome"],
    },
    {
      kind: "license",
      title: "Get a state license",
      detail:
        "Every state and Washington, DC, licenses PAs. In most states a PA must also have an agreement with a supervising or collaborating physician.",
      varies: "The rules on supervision and collaboration differ from state to state.",
      sources: ["blsPA"],
    },
    {
      kind: "training",
      title: "Postgraduate residency or fellowship",
      optional: true,
      detail: "Some PAs choose extra training in a specialty, such as emergency medicine or psychiatry.",
      sources: ["blsPA"],
    },
    {
      kind: "milestone",
      title: "Stay certified",
      detail:
        "PAs log 100 continuing education credits every two years and pass a recertification exam (PANRE or PANRE-LA) once every 10 years.",
      sources: ["nccpaMaintain"],
    },
  ],
  pay: { median: 135880, year: 2025, sources: ["blsPA"] },
  outlook: { percent: 21, period: "2025–35", label: "Much faster than average", sources: ["blsPA"] },
};

export const occupationalTherapist: Career = {
  id: "occupational-therapist",
  name: "Occupational therapist",
  alsoCalled: "OT",
  family: "therapy",
  credential: "OTR",
  about:
    "Occupational therapists help people with injuries, illnesses or disabilities build, recover and keep the skills they need for daily living and working.",
  aboutSources: ["blsOT"],
  steps: [
    {
      kind: "school",
      title: "Earn a bachelor's degree",
      years: [4, 4],
      detail:
        "Any major works if you take the prerequisites, which often include biology and psychology. Some programs also want volunteer or work time in an occupational therapy setting.",
      varies: "Some schools offer combined bachelor's and master's programs.",
      sources: ["blsOT"],
    },
    {
      kind: "school",
      title: "Earn a master's or doctorate in occupational therapy",
      years: [2, 3],
      lengthLabel: "2–3 years (master's)",
      detail:
        "The program must be accredited by ACOTE. Both an entry-level master's (such as an MOT or MS) and an entry-level doctorate (OTD) lead to the same exam and license.",
      varies:
        "ACOTE does not require the doctorate; schools can offer a master's, a doctorate or both. A doctorate adds a 14-week capstone, so it takes longer than the 2 to 3 years shown here for a master's.",
      sources: ["blsOT", "aotaBecome", "acoteStudents"],
    },
    {
      kind: "training",
      title: "Complete Level I and Level II fieldwork",
      detail:
        "Fieldwork is part of the program. Level II fieldwork, with real patients under supervision, lasts at least 24 weeks full time.",
      sources: ["aotaBecome", "acoteFieldwork"],
    },
    {
      kind: "exam",
      title: "Pass the NBCOT exam",
      detail:
        "Graduates of ACOTE-accredited programs take the national exam from NBCOT. Passing it earns the title Occupational Therapist, Registered (OTR).",
      sources: ["nbcotEligibility", "blsOT"],
    },
    {
      kind: "license",
      title: "Get a state license",
      detail: "Every state requires occupational therapists to be licensed.",
      varies: "Each state sets its own licensing rules, including continuing education.",
      sources: ["blsOT", "aotaBecome"],
    },
    {
      kind: "milestone",
      title: "Renew the OTR",
      detail:
        "NBCOT certification is renewed every three years by earning 36 units of professional development.",
      sources: ["nbcotRenew"],
    },
  ],
  pay: { median: 100330, year: 2025, sources: ["blsOT"] },
  outlook: { percent: 15, period: "2025–35", label: "Much faster than average", sources: ["blsOT"] },
};

export const speechLanguagePathologist: Career = {
  id: "speech-language-pathologist",
  name: "Speech-language pathologist",
  alsoCalled: "SLP, or speech therapist",
  family: "therapy",
  credential: "CCC-SLP",
  about:
    "Speech-language pathologists assess and treat people who have trouble communicating or swallowing. Some focus on children, others on older adults.",
  aboutSources: ["blsSLP"],
  steps: [
    {
      kind: "school",
      title: "Earn a bachelor's degree",
      years: [4, 4],
      detail:
        "Many students major in communication sciences and disorders. Other majors work too, as long as you take the required courses in statistics, biology, chemistry or physics, and the social or behavioral sciences.",
      sources: ["ashaCoursework"],
    },
    {
      kind: "school",
      title: "Earn a master's degree in speech-language pathology",
      years: [2, 2],
      detail: "The program must be accredited by the CAA. Most take about 2 years.",
      sources: ["blsSLP", "ashaPathway"],
    },
    {
      kind: "training",
      title: "Complete 400 supervised clinical hours",
      detail:
        "During school, students log at least 400 hours with clients under supervision: 375 hours of direct work and 25 hours of guided observation.",
      varies:
        "ASHA's new standards, which start August 1, 2027, keep the 400 hours but change how some of them are counted.",
      sources: ["ashaPracticum", "ashaStandards2027"],
    },
    {
      kind: "exam",
      title: "Pass the Praxis exam in speech-language pathology",
      detail: "The national Praxis exam (test 5331). ASHA's passing score is 162 on a 100 to 200 scale.",
      sources: ["ashaPraxis"],
    },
    {
      kind: "training",
      title: "Complete a Clinical Fellowship",
      years: [0.75, 0.75],
      lengthLabel: "at least 36 weeks",
      detail:
        "A first job with a mentor who holds ASHA certification: at least 36 weeks and 1,260 hours, mostly spent with patients.",
      varies: "Working part time is allowed, but then the fellowship takes longer.",
      sources: ["ashaCF", "ashaPathway"],
    },
    {
      kind: "exam",
      title: "Earn the CCC-SLP",
      detail:
        "After the fellowship, ASHA reviews the application and awards the Certificate of Clinical Competence in Speech-Language Pathology.",
      sources: ["ashaPathway"],
    },
    {
      kind: "license",
      title: "Get a state license",
      detail: "Every state requires speech-language pathologists to be licensed.",
      varies: "Jobs in public schools may also need a state teaching certificate.",
      sources: ["blsSLP"],
    },
    {
      kind: "milestone",
      title: "Keep certified",
      detail:
        "Certified SLPs complete 30 hours of professional development every three years, including at least one hour on ethics.",
      sources: ["ashaPDH", "ashaEthics"],
    },
  ],
  pay: { median: 97870, year: 2025, sources: ["blsSLP"] },
  outlook: { percent: 17, period: "2025–35", label: "Much faster than average", sources: ["blsSLP"] },
};
