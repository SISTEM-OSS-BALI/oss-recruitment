/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Card,
  Typography,
  Space,
  Button,
  Segmented,
  Empty,
  Tooltip,
  Divider,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  LeftOutlined,
  RightOutlined,
  VideoCameraOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useScheduleInterviews } from "@/app/hooks/interview";

dayjs.locale("en");
dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

type Interview = {
  id: string;
  applicant_id: string;
  schedule_id: string;
  is_online: boolean;
  date: string; // ISO
  start_time: string; // ISO
  meeting_link?: string | null;
  applicant?: {
    user?: { name?: string | null } | null;
    job?: { name?: string | null } | null;
  } | null;
};

function ymd(d: string | Dayjs) {
  const m = typeof d === "string" ? dayjs(d) : d;
  return m.format("YYYY-MM-DD");
}
function hm(d: string | Dayjs) {
  const m = typeof d === "string" ? dayjs(d) : d;
  return m.format("h:mm A");
}

/* ---------- Event pill untuk grid kalender ---------- */
const EventPill: React.FC<{ ev: Interview }> = ({ ev }) => {
  const who = ev.applicant?.user?.name || "Candidate";
  const role = ev.applicant?.job?.job_title || "Interview";
  const leftColor = ev.is_online ? "#2F88FF" : "#E64A3B";
  return (
    <Tooltip
      title={
        <div style={{ lineHeight: 1.4 }}>
          <div>
            <b>{who}</b> • {role}
          </div>
          <div>
            {hm(ev.start_time)} ({ev.is_online ? "Online" : "On-site"})
          </div>
        </div>
      }
    >
      <div
        style={{
          background: ev.is_online ? "#F0F7FF" : "#FDEDED",
          border: "1px solid #E6EAF0",
          borderLeft: `4px solid ${leftColor}`,
          borderRadius: 10,
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {ev.is_online ? (
          <VideoCameraOutlined style={{ fontSize: 14, color: leftColor }} />
        ) : (
          <HomeOutlined style={{ fontSize: 14, color: leftColor }} />
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: 12.5,
            color: "#0F172A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {role}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>
          {hm(ev.start_time)}
        </span>
      </div>
    </Tooltip>
  );
};

/* ---------- Header serbaguna ---------- */
function HeaderBar({
  value,
  setValue,
  mode,
  setMode,
  standalone = false,
}: {
  value: Dayjs;
  setValue: (d: Dayjs) => void;
  mode: "Month" | "Timeline";
  setMode: (m: "Month" | "Timeline") => void;
  /** kalau true dirender di luar Calendar, kalau false dipakai oleh Calendar.headerRender */
  standalone?: boolean;
}) {
  const go = (diff: number) => {
    const unit = mode === "Timeline" ? "day" : "month";
    setValue(value.clone().add(diff, unit));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: standalone ? "8px 8px 16px" : 0,
      }}
    >
      <Title level={3} style={{ margin: 0 }}>
        {mode === "Timeline" ? "Schedule" : "Schedule Calendar"}
      </Title>

      <div style={{ marginLeft: 16 }}>
        <Segmented
          value={mode}
          onChange={(v) => setMode(v as "Month" | "Timeline")}
          options={["Month", "Timeline"]}
        />
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Button icon={<LeftOutlined />} onClick={() => go(-1)} />
        <Text strong style={{ fontSize: 18 }}>
          {mode === "Timeline"
            ? value.format("dddd, MMMM D, YYYY")
            : value.format("MMMM YYYY")}
        </Text>
        <Button icon={<RightOutlined />} onClick={() => go(1)} />
      </div>
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function ScheduleCalendarPage() {
  const { data } = useScheduleInterviews();
  const items: Interview[] = Array.isArray(data) ? (data as any) : [];

  const [mode, setMode] = useState<"Month" | "Timeline">("Month");
  const [value, setValue] = useState<Dayjs>(() => dayjs());

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf()
      ),
    [items]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Interview[]>();
    for (const it of sorted) {
      const key = ymd(it.start_time);
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return map;
  }, [sorted]);

  const upcomingIndex = useMemo(
    () => sorted.findIndex((ev) => dayjs(ev.start_time).isSameOrAfter(dayjs())),
    [sorted]
  );

  /* ----- Month view (single header via Calendar.headerRender) ----- */
  const MonthView = (
    <Calendar
      fullscreen
      value={value}
      onPanelChange={(v) => setValue(v)}
      headerRender={() => (
        <HeaderBar
          value={value}
          setValue={setValue}
          mode={mode}
          setMode={setMode}
        />
      )}
      dateFullCellRender={(date) => {
        const key = ymd(date);
        const events = eventsByDate.get(key) ?? [];
        const isThisMonth = date.isSame(value, "month");
        const isToday = date.isSame(dayjs(), "date");

        return (
          <div
            style={{
              height: 120,
              display: "flex",
              flexDirection: "column",
              padding: 8,
              borderRadius: 10,
              background: isToday ? "rgba(47,136,255,0.10)" : undefined,
              opacity: isThisMonth ? 1 : 0.45,
              border: "1px solid #EEF2F6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isToday ? "#2F88FF" : "#F1F5F9",
                  color: isToday ? "#fff" : "#0F172A",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {date.date()}
              </div>
            </div>

            <div style={{ display: "grid", gap: 6, overflow: "auto" }}>
              {events.slice(0, 3).map((ev) => (
                <EventPill key={ev.id} ev={ev} />
              ))}
              {events.length > 3 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  +{events.length - 3} more
                </Text>
              )}
            </div>
          </div>
        );
      }}
    />
  );

  /* ----- Timeline view (header standalone di atas list) ----- */
  const timelineRange = useMemo(
    () => ({
      start: value.startOf("day"),
      end: value.startOf("day").add(7, "day"),
    }),
    [value]
  );

  const timelineGroups = useMemo(() => {
    const groups: { label: string; key: string; events: Interview[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = timelineRange.start.add(i, "day");
      const key = ymd(d);
      const events = (eventsByDate.get(key) ?? []).sort(
        (a, b) => dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf()
      );

      let label: string;
      if (d.isSame(dayjs(), "day")) label = `Today, ${d.format("MMMM D")}`;
      else if (d.isSame(dayjs().add(1, "day"), "day"))
        label = `Tomorrow, ${d.format("MMMM D")}`;
      else label = d.format("dddd, MMMM D");

      groups.push({ label, key, events });
    }
    return groups;
  }, [eventsByDate, timelineRange.start]);

  const TimelineCard: React.FC<{ ev: Interview; highlighted?: boolean }> = ({
    ev,
    highlighted,
  }) => {
    const role = ev.applicant?.job?.job_title || "Interview";
    const who = ev.applicant?.user?.name || "Candidate";
    const accent = highlighted ? "#2F88FF" : "#E6EAF0";
    return (
      <div
        style={{
          borderRadius: 14,
          border: `2px solid ${accent}`,
          background: "#F8FAFC",
          padding: "14px 16px",
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#1677ff", fontWeight: 800 }}>
          {hm(ev.start_time)}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
            {role}
          </div>
          <div style={{ color: "#94A3B8", marginTop: 4 }}>
            {who} • {ev.is_online ? "Online" : "On-site"}
          </div>
        </div>
      </div>
    );
  };

  const TimelineView = (
    <div>
     <div style={{ marginBottom : 30 }}>

      <HeaderBar
        value={value}
        setValue={setValue}
        mode={mode}
        setMode={setMode}
        standalone
      />
     </div>
      <Divider style={{ margin: "8px 0 12px" }} />

      {timelineGroups.every((g) => g.events.length === 0) ? (
        <Empty description="No interviews in this range" />
      ) : (
        timelineGroups.map((g) => (
          <div key={g.key} style={{ marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0 }}>
              {g.label}
            </Title>
            <Divider style={{ margin: "8px 0 16px" }} />
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {g.events.length === 0 ? (
                <Text type="secondary">No events</Text>
              ) : (
                g.events.map((ev, idxInGroup) => {
                  const idxGlobal = sorted.findIndex((s) => s.id === ev.id);
                  const isNext =
                    idxGlobal === upcomingIndex &&
                    dayjs(ev.start_time).isSameOrAfter(dayjs());
                  return (
                    <TimelineCard
                      key={ev.id}
                      ev={ev}
                      highlighted={isNext && idxInGroup === 0}
                    />
                  );
                })
              )}
            </Space>
          </div>
        ))
      )}
    </div>
  );

  /* ---------- Page shell ---------- */
  return (
    <div style={{ padding: 20 }}>
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 16 }}>
        {/* <div style={{ marginBottom: 6, color: "#64748b" }}>
          <Space size={8} align="center">
            <span style={{ fontSize: 14 }}>Timezone:</span>
            <Text strong>{tz.replace("_", " ")}</Text>
          </Space>
        </div> */}

        {/* Tidak ada header ganda lagi */}
        {mode === "Month" ? MonthView : TimelineView}
      </Card>
    </div>
  );
}
