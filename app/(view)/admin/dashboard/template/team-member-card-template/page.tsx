"use client";

import LoadingSplash from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const TeamMemberCardTemplateContent = lazy(() => import("./content"));

export default function TeamMemberCardTemplatePage() {
  return (
    <Suspense fallback={<LoadingSplash />}>
      <TeamMemberCardTemplateContent />
    </Suspense>
  );
}
