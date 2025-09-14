/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, User } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface UserDataModel extends User {}

export interface UserPayloadCreateModel
  extends Prisma.UserUncheckedCreateInput {}

export interface UserPayloadUpdateModel
  extends Omit<Prisma.UserUncheckedUpdateInput, GeneralOmitModel> {}

export interface UserFormModel extends Omit<UserDataModel, GeneralOmitModel> {}
