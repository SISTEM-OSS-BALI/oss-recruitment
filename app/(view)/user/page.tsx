"use client"

import { Suspense, lazy } from "react";

const UserContent = lazy(() => import("./content"));

export default function User() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserContent />
        </Suspense>
    );
}