import { Suspense, lazy } from "react";

const GuidebookContent = lazy(() => import("./content"));

export default function GuidebookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuidebookContent />
    </Suspense>
  );
}
