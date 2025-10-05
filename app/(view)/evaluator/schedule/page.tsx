"use client"

import Loading from "@/app/components/common/custom-loading";
import { Suspense, lazy } from "react";

export default function Page() {
    const Content = lazy(() => import("./content"));
    return (
        <Suspense fallback={<Loading />}>
            <Content />
        </Suspense>
    );
}   