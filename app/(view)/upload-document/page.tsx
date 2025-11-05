"use client";

import { Suspense, lazy } from "react";

const UploadDocumentContent = lazy(() => import("./content"));

export default function UploadDocumentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadDocumentContent />
    </Suspense>
  );
}
