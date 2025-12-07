"use client";

import { useMobile } from "@/app/hooks/use-mobile";

export default function Content() {
  const isMobile = useMobile();
  return (
    <div
      style={{
        padding: isMobile ? "16px" : "32px",
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Home
    </div>
  );
}
