"use client";

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const RegisterContent = lazy(() => import("./content"));

export default function Register() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterContent />
    </Suspense>
  );
}
