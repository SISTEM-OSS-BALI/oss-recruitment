"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const CreateJobContent = lazy(() => import("./content"));

export default function CreateJobPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CreateJobContent />
    </Suspense>
  );
}
