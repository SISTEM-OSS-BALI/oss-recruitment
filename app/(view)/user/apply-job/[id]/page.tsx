"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ApplyJobContent = lazy(() => import("./content"));

export default function ApplyJob() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplyJobContent />
    </Suspense>
  );
}
