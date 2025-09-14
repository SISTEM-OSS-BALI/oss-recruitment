"use client";

import Loading from "@/app/components/common/custom-loading";

import { Suspense, lazy } from "react";

const UploadIdentityContent = lazy(() => import("./content"));

export default function UploadIdentity() {
  return (
    <Suspense fallback={<Loading />}>
      <UploadIdentityContent />
    </Suspense>
  );
}
