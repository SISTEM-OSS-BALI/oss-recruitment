"use client";

import { useMobile } from "@/app/hooks/use-mobile";
import TabLayout from "./tab-layout";

export default function Content() {
  const isMobile = useMobile();
  return (
    <div
      style={{
        padding: isMobile ? "6px" : "32px",
      }}
    >
      <TabLayout />
    </div>
  );
}
