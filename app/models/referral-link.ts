import { ReferralLink } from "@prisma/client";

import { JobDataModel } from "./job";

export interface ReferralLinkDataModel extends ReferralLink {}

export type ReferralJobDataModel = {
  referral: ReferralLinkDataModel;
  job: JobDataModel;
};
