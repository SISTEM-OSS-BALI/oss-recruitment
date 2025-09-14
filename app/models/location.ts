/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Location } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface LocationDataModel extends Location {}

export interface LocationPayloadCreateModel
  extends Prisma.LocationUncheckedCreateInput {}

export interface LocationPayloadUpdateModel
  extends Omit<Prisma.LocationUncheckedUpdateInput, GeneralOmitModel> {}

export interface LocationFormModel
  extends Omit<LocationDataModel, GeneralOmitModel> {}
