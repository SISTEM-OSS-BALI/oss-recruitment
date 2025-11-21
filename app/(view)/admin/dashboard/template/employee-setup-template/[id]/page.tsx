"use client";

import { Suspense, lazy } from "react";

export default function EmployeeSetupTemplatePage() {
  const EmployeeSetupTemplateContent = lazy(() => import("./content"));
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeSetupTemplateContent />
    </Suspense>
  );
}
