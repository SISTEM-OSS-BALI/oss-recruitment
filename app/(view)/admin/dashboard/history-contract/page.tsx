"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const HistoryContractContent = lazy(() => import("./content"));
export default function HistoryContract() {
  return (
    <Suspense fallback={<Loading />}>
      <HistoryContractContent />
    </Suspense>
  );
}
