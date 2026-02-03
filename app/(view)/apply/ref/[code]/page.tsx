"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ApplyJobContent = lazy(
  () => import("@/app/(view)/user/apply-job/[id]/content")
);

export default function ApplyReferralPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplyJobContent />
    </Suspense>
  );
}
