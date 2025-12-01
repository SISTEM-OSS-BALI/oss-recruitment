"use client";

import LoadingSplash from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const UserManagementContent = lazy(() => import("./content"));

export default function UserManagementPage() {
  return (
    <Suspense fallback={<LoadingSplash />}>
      <UserManagementContent />
    </Suspense>
  );
}
