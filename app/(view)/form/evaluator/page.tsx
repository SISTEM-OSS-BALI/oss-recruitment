'use client'

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const EvaluatorContent = lazy(() => import("./content"));

export default function Evaluator() {
    return (
        <Suspense fallback={<Loading />}>
            <EvaluatorContent />
        </Suspense>
    );
}