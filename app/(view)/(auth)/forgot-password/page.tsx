"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ForgotPasswordContent = lazy(() => import("./content"));

export default function ForgotPassword() {
  return (
    <Suspense fallback={<Loading />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
