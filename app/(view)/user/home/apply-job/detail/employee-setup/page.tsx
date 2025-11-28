"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

export default function EmployeeSetup() {
  const EmployeeSetupPage = lazy(() => import("./content"));

  return (
    <Suspense fallback={<Loading />}>
      <EmployeeSetupPage />
    </Suspense>
  );
}
