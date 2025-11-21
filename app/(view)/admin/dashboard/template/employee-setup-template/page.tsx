"use client";

import LoadingSplash from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const EmployeeSetupTemplateContent = lazy(() => import("./content"));
export default function EmployeeSetupTemplatePage() {
  return (
    <Suspense fallback={<LoadingSplash />}>
      <EmployeeSetupTemplateContent />
    </Suspense>
  );
}
