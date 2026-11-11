// Every page the careers data rests on, with the day it was read.
// The order here is the order of the numbered list at the foot of the careers page.
// To add a fact, add (or reuse) a source here and name its id on the fact.

import type { Source } from "./types";

const READ = "2026-11-10";

export const sources = {
  // US Bureau of Labor Statistics, Occupational Outlook Handbook (pay is May 2025; outlook is 2025–35)
  blsPhysicians: {
    publisher: "US Bureau of Labor Statistics",
    title: "Physicians and Surgeons (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm",
    accessed: READ,
  },
  blsRN: {
    publisher: "US Bureau of Labor Statistics",
    title: "Registered Nurses (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/registered-nurses.htm",
    accessed: READ,
  },
  blsNP: {
    publisher: "US Bureau of Labor Statistics",
    title: "Nurse Anesthetists, Nurse Midwives, and Nurse Practitioners (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/nurse-anesthetists-nurse-midwives-and-nurse-practitioners.htm",
    accessed: READ,
  },
  blsPA: {
    publisher: "US Bureau of Labor Statistics",
    title: "Physician Assistants (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/physician-assistants.htm",
    accessed: READ,
  },
  blsOT: {
    publisher: "US Bureau of Labor Statistics",
    title: "Occupational Therapists (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/occupational-therapists.htm",
    accessed: READ,
  },
  blsSLP: {
    publisher: "US Bureau of Labor Statistics",
    title: "Speech-Language Pathologists (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/speech-language-pathologists.htm",
    accessed: READ,
  },
  blsEMT: {
    publisher: "US Bureau of Labor Statistics",
    title: "EMTs and Paramedics (Occupational Outlook Handbook)",
    url: "https://www.bls.gov/ooh/healthcare/EMTs-and-Paramedics.htm",
    accessed: READ,
  },

  // Physicians: admission, medical school and exams
  aamcRequirements: {
    publisher: "Association of American Medical Colleges (AAMC)",
    title: "Admission Requirements",
    url: "https://students-residents.aamc.org/medical-school-admission-requirements/admission-requirements",
    accessed: READ,
  },
  aamcMCAT: {
    publisher: "Association of American Medical Colleges (AAMC)",
    title: "About the MCAT Exam",
    url: "https://students-residents.aamc.org/applying-medical-school/taking-mcat-exam/about-mcat-exam/",
    accessed: READ,
  },
  aacomOMT: {
    publisher: "American Association of Colleges of Osteopathic Medicine (AACOM)",
    title: "About Osteopathic Medicine",
    url: "https://www.aacom.org/become-a-doctor/about-osteopathic-medicine",
    accessed: READ,
  },
  fsmbPathway: {
    publisher: "Federation of State Medical Boards (FSMB)",
    title: "Pathway to Licensure (chart)",
    url: "https://www.fsmb.org/siteassets/usmle-step3/pdfs/pathway-to-licensure.pdf",
    accessed: READ,
  },
  usmleBulletin: {
    publisher: "United States Medical Licensing Examination (USMLE)",
    title: "2027 Bulletin of Information",
    url: "https://www.usmle.org/sites/default/files/2026-08/2027Bulletin.pdf",
    accessed: READ,
  },
  usmleScoring: {
    publisher: "United States Medical Licensing Examination (USMLE)",
    title: "Examination Results and Scoring",
    url: "https://www.usmle.org/scores-transcripts/examination-results-and-scoring",
    accessed: READ,
  },
  nbomeComlex: {
    publisher: "National Board of Osteopathic Medical Examiners (NBOME)",
    title: "Understanding COMLEX-USA",
    url: "https://nbome.org/resources-for/residency-program-directors/understanding-comlex-usa",
    accessed: READ,
  },
  nbomeScoring: {
    publisher: "National Board of Osteopathic Medical Examiners (NBOME)",
    title: "COMLEX-USA Scoring and Reporting",
    url: "https://www.nbome.org/assessments/comlex-usa/scoring-and-reporting/",
    accessed: READ,
  },

  // Physicians: the Match, residency, licensing and certification
  nrmpAlgorithm: {
    publisher: "National Resident Matching Program (NRMP)",
    title: "How does the matching algorithm work?",
    url: "https://www.nrmp.org/help/item/how-does-the-matching-algorithm-work/",
    accessed: READ,
  },
  nrmpMatch2026: {
    publisher: "National Resident Matching Program (NRMP)",
    title: "NRMP Releases Results of the 2026 Main Residency Match",
    url: "https://www.nrmp.org/about/news/2026/03/nrmp-releases-results-of-the-2026-main-residency-match-for-more-than-38000-future-residents/",
    accessed: READ,
  },
  acgmeSingle: {
    publisher: "Accreditation Council for Graduate Medical Education (ACGME)",
    title: "ACGME, AOA, and AACOM Usher in New Era of Single Accreditation for Graduate Medical Education",
    url: "https://www.acgme.org/newsroom/2020/7/acgme-aoa-and-aacom-usher-in-new-era-of-single-accreditation-for-graduate-medical-education/",
    accessed: READ,
  },
  acgmePeds: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Pediatrics (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/320_pediatrics_2026.pdf",
    accessed: READ,
  },
  acgmeFM: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Family Medicine (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/120_familymedicine_2026.pdf",
    accessed: READ,
  },
  acgmeIM: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Internal Medicine (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/140_internalmedicine_2026.pdf",
    accessed: READ,
  },
  acgmeEM: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Emergency Medicine (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/110_emergencymedicine_2026.pdf",
    accessed: READ,
  },
  acgmePsych: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Psychiatry (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/400_psychiatry_2026.pdf",
    accessed: READ,
  },
  acgmeOBGYN: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Obstetrics and Gynecology (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/220_obstetricsgynecology_2026.pdf",
    accessed: READ,
  },
  acgmeSurgery: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in General Surgery (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/440_generalsurgery_2026.pdf",
    accessed: READ,
  },
  acgmeAnes: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Anesthesiology (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/040_anesthesiology_2026.pdf",
    accessed: READ,
  },
  acgmeRad: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Diagnostic Radiology (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/420_diagnosticradiology_2026.pdf",
    accessed: READ,
  },
  acgmeNeuro: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Neurology (2025)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2025-reformatted-requirements/180_neurology_2025_reformatted.pdf",
    accessed: READ,
  },
  acgmeOrtho: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Orthopaedic Surgery (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/260_orthopaedicsurgery_2026.pdf",
    accessed: READ,
  },
  acgmeNSGY: {
    publisher: "ACGME",
    title: "Program Requirements for Graduate Medical Education in Neurological Surgery (2026)",
    url: "https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/160_neurologicalsurgery_2026.pdf",
    accessed: READ,
  },
  acgmeFellowship: {
    publisher: "ACGME",
    title: "Physician Education",
    url: "https://www.acgme.org/about/physician-education/",
    accessed: READ,
  },
  abpSubspecialties: {
    publisher: "American Board of Pediatrics",
    title: "Subspecialties",
    url: "https://www.abp.org/subspecialties",
    accessed: READ,
  },
  fsmbLicensure: {
    publisher: "Federation of State Medical Boards (FSMB)",
    title: "About Physician Licensure",
    url: "https://production.fsmb.org/u.s.-medical-regulatory-trends-and-actions/guide-to-medical-regulation-in-the-united-states/about-physician-licensure/",
    accessed: READ,
  },
  abmsFAQ: {
    publisher: "American Board of Medical Specialties (ABMS)",
    title: "Frequently Asked Questions",
    url: "https://abms.org/faqs/",
    accessed: READ,
  },
  abmsGuide: {
    publisher: "American Board of Medical Specialties (ABMS)",
    title: "Guide to Medical Specialties, 2026 Edition",
    url: "https://abms.org/wp-content/uploads/2026/07/20261212_GuideMedicalSpecialties_WEB_V3.pdf",
    accessed: READ,
  },
  aoaBoards: {
    publisher: "American Osteopathic Association (AOA)",
    title: "About AOA Board Certification",
    url: "https://certification.osteopathic.org/about/",
    accessed: READ,
  },

  // Nursing
  aacnEducationImpact: {
    publisher: "American Association of Colleges of Nursing (AACN)",
    title: "The Impact of Education on Nursing Practice",
    url: "https://www.aacnnursing.org/news-data/fact-sheets/impact-of-education-on-nursing-practice",
    accessed: READ,
  },
  aacnAccelerated: {
    publisher: "American Association of Colleges of Nursing (AACN)",
    title: "Accelerated Baccalaureate and Master's Degrees in Nursing",
    url: "https://www.aacnnursing.org/news-data/fact-sheets/accelerated-baccalaureate-and-masters-degrees-in-nursing",
    accessed: READ,
  },
  aacnDegreeCompletion: {
    publisher: "American Association of Colleges of Nursing (AACN)",
    title: "Degree Completion Programs for Registered Nurses",
    url: "https://www.aacnnursing.org/news-data/fact-sheets/degree-completion-programs-for-rns",
    accessed: READ,
  },
  ncsbnNGN: {
    publisher: "National Council of State Boards of Nursing (NCSBN)",
    title: "NCSBN Launches Next Generation NCLEX Exam",
    url: "https://www.ncsbn.org/news/ncsbn-launches-next-generation-nclex-exam",
    accessed: READ,
  },
  nclexNGN: {
    publisher: "National Council of State Boards of Nursing (NCSBN)",
    title: "Next Generation NCLEX",
    url: "https://www.nclex.com/next-generation-nclex.page",
    accessed: READ,
  },
  nlc: {
    publisher: "Nurse Licensure Compact",
    title: "Nurse Licensure Compact",
    url: "https://www.nursecompact.com/",
    accessed: READ,
  },
  aacnMasters: {
    publisher: "American Association of Colleges of Nursing (AACN)",
    title: "Master's Education",
    url: "https://www.aacnnursing.org/students/nursing-education-pathways/masters-education",
    accessed: READ,
  },
  aacnDNP: {
    publisher: "American Association of Colleges of Nursing (AACN)",
    title: "DNP Education",
    url: "https://www.aacnnursing.org/students/nursing-education-pathways/dnp-education",
    accessed: READ,
  },
  aprnConsensus: {
    publisher: "APRN Consensus Work Group and NCSBN",
    title: "Consensus Model for APRN Regulation",
    url: "https://www.ncsbn.org/public-files/Consensus_Model_for_APRN_Regulation_July_2008.pdf",
    accessed: READ,
  },
  aanpcbCertify: {
    publisher: "American Academy of Nurse Practitioners Certification Board (AANPCB)",
    title: "Certification",
    url: "https://www.aanpcert.org/certify/",
    accessed: READ,
  },
  anccFNP: {
    publisher: "American Nurses Credentialing Center (ANCC)",
    title: "Family Nurse Practitioner Certification",
    url: "https://www.nursingworld.org/our-certifications/family-nurse-practitioner/",
    accessed: READ,
  },
  pncbPC: {
    publisher: "Pediatric Nursing Certification Board (PNCB)",
    title: "CPNP-PC Exam Eligibility",
    url: "https://www.pncb.org/cpnp-pc-exam-eligibility",
    accessed: READ,
  },
  aanpPractice: {
    publisher: "American Association of Nurse Practitioners (AANP)",
    title: "State Practice Environment",
    url: "https://www.aanp.org/advocacy/state/state-practice-environment",
    accessed: READ,
  },
  aanpFPABrief: {
    publisher: "American Association of Nurse Practitioners (AANP)",
    title: "Issues at a Glance: Full Practice Authority",
    url: "https://www.aanp.org/advocacy/advocacy-resource/policy-briefs/issues-full-practice-brief",
    accessed: READ,
  },

  // Physician associates (PAs)
  aapaBecome: {
    publisher: "American Academy of Physician Associates (AAPA)",
    title: "Become a PA",
    url: "https://www.aapa.org/career-central/become-a-pa/",
    accessed: READ,
  },
  aapaTitleVote: {
    publisher: "American Academy of Physician Associates (AAPA)",
    title: "AAPA House of Delegates Votes to Change Profession Title to Physician Associate",
    url: "https://www.aapa.org/news-central/2021/05/aapa-house-of-delegates-votes-to-change-profession-title-to-physician-associate/",
    accessed: READ,
  },
  aapaTitleIowa: {
    publisher: "American Academy of Physician Associates (AAPA)",
    title: "Iowa Marks Major Milestone With Passage of Title Change Legislation",
    url: "https://www.aapa.org/news-central/2026/04/iowa-marks-major-milestone-with-passage-of-title-change-legislation/",
    accessed: READ,
  },
  nccpaHighSchool: {
    publisher: "National Commission on Certification of Physician Assistants (NCCPA)",
    title: "Guide for high school students who want to become a PA",
    url: "https://www.nccpa.net/wp-content/uploads/2023/04/Highschool-Infographic-A-2021.pdf",
    accessed: READ,
  },
  arcpaStandards: {
    publisher: "Accreditation Review Commission on Education for the Physician Assistant (ARC-PA)",
    title: "Accreditation Standards for Physician Assistant Education, 6th Edition",
    url: "https://www.arc-pa.org/wp-content/uploads/2025/10/Standards-6e-10-03-25-Pub-10-09-25.pdf",
    accessed: READ,
  },
  nccpaBecome: {
    publisher: "National Commission on Certification of Physician Assistants (NCCPA)",
    title: "Become Certified",
    url: "https://www.nccpa.net/become-certified/",
    accessed: READ,
  },
  nccpaMaintain: {
    publisher: "National Commission on Certification of Physician Assistants (NCCPA)",
    title: "Maintain Certification",
    url: "https://www.nccpa.net/maintain-certification/",
    accessed: READ,
  },

  // Occupational therapy
  aotaBecome: {
    publisher: "American Occupational Therapy Association (AOTA)",
    title: "Become an OT or OTA",
    url: "https://www.aota.org/career/become-an-ot-ota",
    accessed: READ,
  },
  acoteStudents: {
    publisher: "Accreditation Council for Occupational Therapy Education (ACOTE)",
    title: "Students and the Public",
    url: "https://acoteonline.org/students-public/",
    accessed: READ,
  },
  acoteFieldwork: {
    publisher: "Accreditation Council for Occupational Therapy Education (ACOTE)",
    title: "2023 ACOTE Standards (Standard C.1.12, Level II fieldwork)",
    url: "https://acoteonline.org/?p=3374",
    accessed: READ,
  },
  nbcotEligibility: {
    publisher: "National Board for Certification in Occupational Therapy (NBCOT)",
    title: "Exam Eligibility",
    url: "https://www.nbcot.org/get-certified/eligibility",
    accessed: READ,
  },
  nbcotRenew: {
    publisher: "National Board for Certification in Occupational Therapy (NBCOT)",
    title: "Renew Your Certification",
    url: "https://www.nbcot.org/certification/renew",
    accessed: READ,
  },

  // Speech-language pathology
  ashaCoursework: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Certification Standards for SLP: Course Work and Knowledge Areas",
    url: "https://www.asha.org/certification/certification-standards-for-slp-course-work-and-knowledge-areas/",
    accessed: READ,
  },
  ashaPathway: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Speech-Language Pathology Pathway to Certification",
    url: "https://www.asha.org/Certification/Speech-Language-Pathology-Pathway-To-Certification/",
    accessed: READ,
  },
  ashaPracticum: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Certification Standards for SLP: Clinical Practicum",
    url: "https://www.asha.org/certification/certification-standards-for-slp-clinical-practicum/",
    accessed: READ,
  },
  ashaStandards2027: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "2027 Certification Standards in Speech-Language Pathology",
    url: "https://www.asha.org/certification/2027-slp-certification-standards/",
    accessed: READ,
  },
  ashaPraxis: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "About the Speech-Language Pathology Praxis Exam",
    url: "https://www.asha.org/certification/praxis/about-the-speech-language-pathology-praxis-exam/",
    accessed: READ,
  },
  ashaCF: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Clinical Fellowship",
    url: "https://www.asha.org/certification/clinical-fellowship/",
    accessed: READ,
  },
  ashaPDH: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Professional Development Hours for ASHA Certification",
    url: "https://www.asha.org/certification/pdhs-for-asha-certification/",
    accessed: READ,
  },
  ashaEthics: {
    publisher: "American Speech-Language-Hearing Association (ASHA)",
    title: "Professional Development Requirements for the 2020 Certification Standards",
    url: "https://www.asha.org/certification/prof-dev-for-2020-certification-standards/",
    accessed: READ,
  },

  // Emergency medical services
  nremtEMT: {
    publisher: "National Registry of Emergency Medical Technicians (NREMT)",
    title: "EMT: Full Education Program",
    url: "https://www.nremt.org/Document/EMT-Full-Education-Program",
    accessed: READ,
  },
  nremtScheme: {
    publisher: "National Registry of Emergency Medical Technicians (NREMT)",
    title: "EMT Certification Scheme",
    url: "https://content.nremt.org/static/documents/Certification%20Scheme-NREMT.pdf",
    accessed: READ,
  },
  nremtAge: {
    publisher: "National Registry of Emergency Medical Technicians (NREMT)",
    title: "June 2019 Board Resolutions (minimum age)",
    url: "https://content.nremt.org/static/documents/2019-June%20Board%20Resolutions.pdf",
    accessed: READ,
  },
  nremtParamedic: {
    publisher: "National Registry of Emergency Medical Technicians (NREMT)",
    title: "Paramedic: Full Education Program Pathway",
    url: "https://nremt.org/Document/Paramedic-Full-Education-Program-Pathway",
    accessed: READ,
  },
  emsScope: {
    publisher: "National Highway Traffic Safety Administration, Office of EMS",
    title: "National EMS Scope of Practice Model 2019",
    url: "https://ems.gov/assets/National_EMS_Scope_of_Practice_Model_2019.pdf",
    accessed: READ,
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;
