// types/global.d.ts
import type IORedis from "ioredis";

declare global {
  // pakai var supaya jadi properti global (bukan block-scoped)
  // eslint-disable-next-line no-var
  var __redis__: IORedis | undefined;
}

export {};
