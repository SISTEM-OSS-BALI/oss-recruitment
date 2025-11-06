/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, User, UserInterestTag } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface UserDataModel extends User {
  interestTags: UserInterestTag[];
}

export type UserPayloadCreateModel = Omit<
  Prisma.UserUncheckedCreateInput,
  "interestTags"
> & {
  interestTags?: string[];
};

export type UserPayloadUpdateModel = Omit<
  Prisma.UserUncheckedUpdateInput,
  GeneralOmitModel | "interestTags"
> & {
  interestTags?: string[];
};

export interface UserFormModel extends Omit<UserDataModel, GeneralOmitModel> {}
