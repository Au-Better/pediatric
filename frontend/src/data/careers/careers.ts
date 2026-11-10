// All careers on the roadmap, in the order the page lists them within each group.

import { emt, nursePractitioner, registeredNurse } from "./nursing-and-ems";
import { physicians } from "./physicians";
import { occupationalTherapist, physicianAssociate, speechLanguagePathologist } from "./therapy-and-pa";
import type { Career } from "./types";

export const careers: readonly Career[] = [
  ...physicians,
  registeredNurse,
  nursePractitioner,
  physicianAssociate,
  occupationalTherapist,
  speechLanguagePathologist,
  emt,
];
