"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const QuestionScreeningContent = lazy(() => import("./content"));

export default function QuestionScreening() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestionScreeningContent />
    </Suspense>
  );
}
