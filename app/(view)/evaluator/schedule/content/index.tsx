/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Card,
  Typography,
  Space,
  Button,
  Divider,
  List,
  Empty,
  Badge,
  Modal,
  Radio,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { RadioChangeEvent } from "antd/es/radio";

import { useScheduleEvaluators } from "@/app/hooks/schedule-evaluator";
import { useScheduleInterviews } from "@/app/hooks/interview";
import { useAvailableSchedules } from "@/app/hooks/available-schedule";

dayjs.locale("en");
const { Title, Text } = Typography;

/* -------------------------------- utils -------------------------------- */
const ENG_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const toEngDay = (d: Dayjs) => ENG_DAYS[d.day()];
const hm = (iso?: string) => (iso ? dayjs(iso).format("HH:mm") : "--:--");

function findNearestAvailableDate(
  avail?: Array<{ day: string; slots: Array<{ start: string; end: string }> }>
): Dayjs {
  const today = dayjs().startOf("day");
  if (!avail?.length) return today;

  const daysWithSlot = new Set(
    avail
      .filter((d) => d.slots?.length > 0)
      .map((d) => d.day as (typeof ENG_DAYS)[number])
  );

  for (let i = 0; i < 90; i++) {
    const candidate = today.add(i, "day");
    if (daysWithSlot.has(toEngDay(candidate))) return candidate;
  }
  return today;
}

type Interval = { start: string; end: string };
type Slot = { startISO: string; endISO: string };

function ceilToNextN(d: dayjs.Dayjs, minutesStep: number) {
  const m = d.minute();
  const add = m % minutesStep === 0 ? 0 : minutesStep - (m % minutesStep);
  return d.add(add, "minute").second(0).millisecond(0);
}

function buildSlotsFromIntervals(
  date: Dayjs,
  intervals: Interval[],
  slotDurationMin = 30
): Slot[] {
  const slots: Slot[] = [];
  const startOfDay = date.startOf("day");

  for (const iv of intervals) {
    if (!iv.start || !iv.end) continue;

    let cur = startOfDay
      .hour(dayjs(iv.start).hour())
      .minute(dayjs(iv.start).minute())
      .second(0)
      .millisecond(0);

    const end = startOfDay
      .hour(dayjs(iv.end).hour())
      .minute(dayjs(iv.end).minute())
      .second(0)
      .millisecond(0);

    if (!end.isAfter(cur)) continue;

    // mulai di kelipatan N menit
    cur = ceilToNextN(cur, slotDurationMin);

    while (true) {
      const nextEnd = cur.add(slotDurationMin, "minute");
      if (nextEnd.isAfter(end)) break;

      slots.push({
        startISO: cur.toDate().toISOString(),
        endISO: nextEnd.toDate().toISOString(),
      });
      cur = nextEnd;
    }
  }

  // sembunyikan slot yang sudah lewat bila hari ini
  const now = dayjs();
  if (date.isSame(now, "day")) {
    return slots.filter((s) => dayjs(s.startISO).isAfter(now));
  }
  return slots;
}

/* ------------------------------- component ------------------------------- */
export default function Page() {
  /* schedules list → untuk default schedule_id dan template hari */
  const { data: schedulesData } = useScheduleEvaluators({});

  const defaultScheduleId = useMemo(
    () =>
      schedulesData?.find((se: any) => se?.evaluator?.is_default)
        ?.schedule_id ?? null,
    [schedulesData]
  );

  const { onCreate: createSchedule } = useScheduleInterviews();

  const params = useSearchParams();
  const schedule_id = params.get("schedule_id") ?? defaultScheduleId ?? "";
  const applicant_id = params.get("applicant_id") ?? "";

  const [value, setValue] = useState<Dayjs>(() => dayjs().startOf("day"));
  const hasAlignedInitialDateRef = useRef(false);

  // reset alignment saat ganti schedule
  useEffect(() => {
    hasAlignedInitialDateRef.current = false;
  }, [schedule_id]);

  // tanggal yang dikirim ke API (ISO UTC)
  const selectedDateISO = useMemo(
    () => value.startOf("day").toDate().toISOString(),
    [value]
  );

  // data available untuk tanggal terpilih
  const { data: availData, fetchLoading } = useAvailableSchedules({
    schedule_id,
    selected_date: selectedDateISO,
  });

  const available = availData?.available ?? [];

  // zona waktu display
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // align ke tanggal terdekat yang memiliki slot setelah data available datang
  useEffect(() => {
    if (!available.length || hasAlignedInitialDateRef.current) return;
    const nearest = findNearestAvailableDate(available);
    if (!nearest.isSame(value, "day")) setValue(nearest);
    hasAlignedInitialDateRef.current = true;
  }, [available, value]);

  /* ---------------- template hari dari schedule aktif (untuk dot abu-abu) ---------------- */
  const templateDays = useMemo(() => {
    const se = schedulesData?.find((se: any) => se.schedule_id === schedule_id);
    return se?.days ?? [];
  }, [schedulesData, schedule_id]);

  // set hari kerja evaluator (hanya yang isAvailable)
  const daysWithTemplate = useMemo(() => {
    return new Set(
      templateDays.filter((d: any) => d.isAvailable).map((d: any) => d.day) // "Sunday"..."Saturday"
    );
  }, [templateDays]);

  // set hari yang punya slot available untuk tanggal terpilih
  const daysWithAvail = useMemo(() => {
    return new Set(
      (available ?? [])
        .filter((d: any) => (d.slots?.length ?? 0) > 0)
        .map((d: any) => d.day)
    );
  }, [available]);

  /* ---------------- slots untuk panel kanan ---------------- */
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const engDay = useMemo(() => toEngDay(value), [value]);

  const dayAvail = useMemo(
    () => available.find((d: any) => d.day === engDay),
    [available, engDay]
  );

  const slotDurationMin = 30;
  const slots: Slot[] = useMemo(() => {
    const intervals: Interval[] = (dayAvail?.slots ?? []).map((iv: any) => ({
      start: iv.start,
      end: iv.end,
    }));
    return buildSlotsFromIntervals(value, intervals, slotDurationMin);
  }, [dayAvail?.slots, value]);

  /* ---------------- submit ---------------- */
  const [openModal, setOpenModal] = useState(false);
  const [meetingType, setMeetingType] = useState<"online" | "offline">(
    "online"
  );
  // const [meetingLink, setMeetingLink] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const onContinue = () => {
    if (selectedIndex == null) return;
    setOpenModal(true);
  };

  const onSubmitSchedule = async () => {
    if (selectedIndex == null) return;

    try {
      setSubmitting(true);
      const slot = slots[selectedIndex];

      await createSchedule({
        applicant_id,
        schedule_id,
        date: selectedDateISO, // kirim ISO yg sama
        start_time: slot.startISO,
        is_online: meetingType === "online",
      });

      message.success("Interview berhasil dijadwalkan 🎉");
      setOpenModal(false);
      // setMeetingLink("");
      setSelectedIndex(null);
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Terjadi kesalahan saat menyimpan jadwal");
    } finally {
      setSubmitting(false);
    }
  };

  const orgTitle = "Select Date & Time";

  /* ------------------------------- render ------------------------------- */
  return (
    <div
      style={{
        padding: 24,
        display: "grid",
        gap: 16,
        gridTemplateColumns: "360px 1fr",
        background:
          "linear-gradient(180deg, rgba(22,119,255,0.08) 0%, rgba(22,119,255,0.00) 180px) #f7f8fb",
        minHeight: "100vh",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      {/* LEFT: Calendar */}
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            {orgTitle}
          </Title>

          {/* <Space size={8} align="center">
            <EnvironmentOutlined />
            <Text>{tz.replace("_", " ")}</Text>
          </Space> */}

          <Divider style={{ margin: "12px 0" }} />

          <Calendar
            fullscreen={false}
            value={value}
            onSelect={(d) => {
              // opsional: kalau kamu ingin hanya boleh klik hari kerja evaluator, uncomment:
              // if (!daysWithTemplate.has(toEngDay(d))) return;

              hasAlignedInitialDateRef.current = true;
              setValue(d.startOf("day"));
              setSelectedIndex(null);
            }}
            disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
            headerRender={({ value: v, onChange }) => {
              const month = v.month();
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 8px 12px",
                    alignItems: "center",
                  }}
                >
                  <Button
                    type="text"
                    onClick={() => onChange(v.clone().month(month - 1))}
                    icon={<span style={{ fontSize: 16 }}>‹</span>}
                  />
                  <Text strong style={{ fontSize: 16 }}>
                    {v.format("MMMM YYYY")}
                  </Text>
                  <Button
                    type="text"
                    onClick={() => onChange(v.clone().month(month + 1))}
                    icon={<span style={{ fontSize: 16 }}>›</span>}
                  />
                </div>
              );
            }}
            dateFullCellRender={(d) => {
              const isSelected = d.isSame(value, "date");
              const dayName = toEngDay(d);

              // dot: selalu tampil untuk hari kerja template.
              // biru = ada slot (available) untuk tanggal ini
              // abu-abu = hanya hari kerja template, tapi tanggal tsb kosong
              const inTemplate = daysWithTemplate.has(dayName);
              const hasAvail = daysWithAvail.has(dayName);

              const dot = inTemplate ? (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    margin: "4px auto 0",
                    borderRadius: "100%",
                    background: hasAvail ? "#1677ff" : "#ccd3e0",
                  }}
                />
              ) : null;

              return (
                <div
                  style={{
                    height: 36,
                    width: 36,
                    display: "grid",
                    placeItems: "center",
                    margin: "4px auto",
                    borderRadius: 10,
                    background: isSelected ? "#1677ff14" : undefined,
                    border: isSelected
                      ? "1.5px solid #1677ff"
                      : "1px solid #E8EAEE",
                    opacity: d.isBefore(dayjs().startOf("day")) ? 0.4 : 1,
                  }}
                >
                  <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 500 }}>{d.date()}</div>
                    {dot}
                  </div>
                </div>
              );
            }}
          />
        </Space>
      </Card>

      {/* RIGHT: Slots */}
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{
          padding: 20,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {value.format("dddd, MMMM D")}
          </Title>
        </div>

        <div style={{ overflow: "auto", paddingRight: 4, maxHeight: 460 }}>
          {fetchLoading ? (
            <Empty
              description="Loading..."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : !dayAvail || (dayAvail.slots?.length ?? 0) === 0 ? (
            <Empty
              description="No available intervals"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : slots.length === 0 ? (
            <Empty
              description="No available 30-min slots"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={slots}
              split={false}
              renderItem={(slot, index) => {
                const isActive = index === (selectedIndex ?? -1);
                return (
                  <List.Item style={{ padding: 0, marginBottom: 12 }}>
                    <Button
                      block
                      type={isActive ? "primary" : "default"}
                      size="large"
                      onClick={() => setSelectedIndex(index)}
                      style={{
                        height: 56,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 12,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 16 }}>
                        {hm(slot.startISO)} – {hm(slot.endISO)}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Text type="secondary" strong>
                          30 min
                        </Text>
                        {isActive && (
                          <Badge
                            color="#ffffff"
                            text={
                              <span style={{ color: "#fff" }}>SELECTED</span>
                            }
                          />
                        )}
                      </span>
                    </Button>
                  </List.Item>
                );
              }}
            />
          )}
        </div>

        <div>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Space>
              <ClockCircleOutlined />
              <Text>{selectedIndex != null ? `30 min` : "—"}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text>{value.format("dddd, MMMM D")}</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>{tz}</Text>
            </Space>
          </Space>
          <Button
            type="primary"
            size="large"
            block
            disabled={selectedIndex == null}
            style={{ marginTop: 12, borderRadius: 10 }}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </Card>

      {/* Modal type & link */}
      <Modal
        title="Choose interview type"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={onSubmitSchedule}
        okText={submitting ? "Saving..." : "Schedule"}
        okButtonProps={{ loading: submitting }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Radio.Group
            value={meetingType}
            onChange={(e: RadioChangeEvent) => setMeetingType(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value="online">Online (meeting link)</Radio>
              <Radio value="offline">Offline (on-site)</Radio>
            </Space>
          </Radio.Group>

          {/* {meetingType === "online" && (
            <Form layout="vertical">
              <Form.Item
                label="Meeting link"
                required
                validateStatus={
                  !meetingLink && submitting ? "error" : undefined
                }
                help={
                  !meetingLink && submitting ? "Link wajib diisi" : undefined
                }
              >
                <Input
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </Form.Item>
            </Form>
          )} */}
        </Space>
      </Modal>

      <style jsx>{`
        @media (max-width: 1100px) {
          div[style*="grid-template-columns: 360px 1fr"] {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
