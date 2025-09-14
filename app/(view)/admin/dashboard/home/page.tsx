"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const DashboardContent = lazy(() => import("./content"));

export default function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
