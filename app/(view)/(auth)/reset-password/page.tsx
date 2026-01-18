"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ResetPasswordContent = lazy(() => import("./content"));

export default function ResetPassword() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
