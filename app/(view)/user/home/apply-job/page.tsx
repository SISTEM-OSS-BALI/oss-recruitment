"use client";

import { Suspense, lazy } from "react";

const ApplyJobContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyJobContent />
    </Suspense>
  );
}
