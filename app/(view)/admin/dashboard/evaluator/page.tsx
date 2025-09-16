"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const EvalutorContent = lazy(() => import("./content"));

export default function Evalutor() {
  return (
    <Suspense fallback={<Loading />}>
      <EvalutorContent />
    </Suspense>
  );
}
