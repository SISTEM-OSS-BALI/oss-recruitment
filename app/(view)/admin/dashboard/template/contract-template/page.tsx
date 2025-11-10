'use client'

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

const ContractTemplateContent = lazy(() => import("./content"));

export default function ContractTemplate() {
    return (
        <Suspense fallback={<Loading />}>
            <ContractTemplateContent />
        </Suspense>
    );
}