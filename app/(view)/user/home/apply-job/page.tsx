"use client";

import LoadingSplash from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ApplyJobContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<LoadingSplash/>}>
      <ApplyJobContent />
    </Suspense>
  );
}
