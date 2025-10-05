"use client";

import { Suspense, lazy } from "react";

const ScheduleContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScheduleContent />
    </Suspense>
  );
}
