"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const QuestionScreeningContent = lazy(
  () => import("@/app/(view)/user/apply-job/[id]/question-screening/content")
);

export default function ReferralQuestionScreening() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestionScreeningContent />
    </Suspense>
  );
}
