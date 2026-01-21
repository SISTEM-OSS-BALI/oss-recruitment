"use client";

import LoadingSplash from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const UserContent = lazy(() => import("./content"));

export default function User() {
  return (
    <Suspense fallback={<LoadingSplash />}>
      <UserContent />
    </Suspense>
  );
}
