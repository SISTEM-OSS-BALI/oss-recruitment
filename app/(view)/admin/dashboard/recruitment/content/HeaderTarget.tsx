// admin/dashboard/recruitment/components/HeaderStatusCard.tsx
"use client";

import { Card } from "antd";
import { useRouter } from "next/navigation";
import { useDrop } from "react-dnd";
import { useRecruitment } from "../context";
import { DND_ITEM } from "@/app/utils/types";


export default function HeaderStatusCard({
  k,
  label,
  count,
  active,
}: {
  k: string; // "all" | "screening" | "qualified" | ...
  label: string;
  count: number;
  active: boolean;
}) {
  const router = useRouter();
  const { onUpdateStatus } = useRecruitment();

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: DND_ITEM.CANDIDATE,
      canDrop: () => k !== "all", // “all” bukan stage
      drop: (item: { id: string }) => onUpdateStatus?.(item.id, k),
      collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
    }),
    [onUpdateStatus, k]
  );

  const bg = active ? "#2370ff" : isOver && canDrop ? "#eaf2ff" : "#fff";
  const color = active ? "#fff" : "#1f1f1f";
  const border = active
    ? "1.5px solid #2370ff"
    : isOver && canDrop
    ? "1.5px solid #2370ff"
    : "1.5px solid #eee";
  const shadow = active
    ? "0 2px 8px #2370ff33"
    : isOver && canDrop
    ? "0 2px 8px #2370ff22"
    : "0 1px 6px #d6d6d633";

  return (
    <div
      ref={dropRef}
      onClick={() =>
        router.push(`/admin/dashboard/recruitment/${k === "all" ? "" : k}`)
      }
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <Card
        style={{
          minWidth: 200,
          textAlign: "center",
          background: bg,
          color,
          fontWeight: active ? 600 : 500,
          border,
          boxShadow: shadow,
          borderRadius: 12,
          transition: "0.15s",
        }}
        bodyStyle={{ padding: "16px 12px" }}
      >
        <div style={{ fontSize: 28, fontWeight: 700 }}>{count}</div>
        <div style={{ fontSize: 15 }}>{label}</div>
      </Card>
    </div>
  );
}
