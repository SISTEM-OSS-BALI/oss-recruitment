"use client"

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const CardTemplateContent = lazy(() => import("./content"));
export default function CardTemplate() {
    return (
        <Suspense fallback={<Loading />}>
            <CardTemplateContent />
        </Suspense>
    );
}