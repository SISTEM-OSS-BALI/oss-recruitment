/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Form,
  Checkbox,
  TimePicker,
  Space,
  Button,
  Typography,
  message,
  Table,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useEvalutors } from "@/app/hooks/evaluator";
import { EvaluatorColumns } from "./columns";
import { useScheduleEvaluators } from "@/app/hooks/schedule-evaluator";
import { useDeleteDay } from "@/app/hooks/delete-day";
import LoadingSplash from "@/app/components/common/custom-loading";

const { Title } = Typography;

/* ---------- Types ---------- */
type DayEng =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimeSlot = {
  id?: string | null; // <-- time_id (ScheduleTime)
  day_id?: string | null; // <-- day_id (ScheduleDay) (opsional, useful di masa depan)
  start: string | null;
  end: string | null;
};

type DaySchedule = {
  schedule_id: string;
  day_id?: string | null; // <-- bawakan day_id juga
  day: DayEng;
  isAvailable: boolean;
  times: TimeSlot[];
};

/* ---------- Const ---------- */
const DAYS: DayEng[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_FMT = "HH:mm";

/** "HH:mm" → ISO now (lokal) */
const hmToISO = (hm: string) => {
  const [h, m] = hm.split(":").map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

/** ISO → "HH:mm" (lokal) */
const isoToHM = (iso?: string | null) =>
  iso ? dayjs(iso).format(TIME_FMT) : null;

function createEmptySchedule(): DaySchedule[] {
  return DAYS.map((day) => ({
    schedule_id: "",
    day,
    isAvailable: false,
    times: [{ id: null, day_id: null, start: null, end: null }],
  }));
}

/** API JSON → UI state (`DaySchedule[]`) */
function fromApiToUi(apiSchedule: any | undefined): DaySchedule[] {
  const base = createEmptySchedule();
  if (!apiSchedule) return base;

  const scheduleId: string = apiSchedule.schedule_id ?? "";

  const idxByDay = new Map<DayEng, number>();
  base.forEach((d, i) => idxByDay.set(d.day, i));

  (apiSchedule.days ?? []).forEach((d: any) => {
    const dayName = d.day as DayEng;
    if (!idxByDay.has(dayName)) return;

    const i = idxByDay.get(dayName)!;
    const timesApi = Array.isArray(d.times) ? d.times : [];

    const timesUi: TimeSlot[] =
      timesApi.length > 0
        ? timesApi.map((t: any) => ({
            id: t.time_id ?? null, // <-- bawa time_id
            day_id: d.day_id ?? null, // <-- bawa day_id
            start: isoToHM(t.startTime),
            end: isoToHM(t.endTime),
          }))
        : [{ id: null, day_id: d.day_id ?? null, start: null, end: null }];

    base[i] = {
      schedule_id: scheduleId,
      day_id: d.day_id ?? null, // <-- bawa day_id
      day: dayName,
      isAvailable: Boolean(d.isAvailable),
      times: timesUi,
    };
  });

  return base;
}

/* ---------- Component ---------- */
export default function SchedulePage() {
  // drawer
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // simpan + delete
  const [loadingInit, setLoadingInit] = useState(false); // isi form awal

  // data evaluator & schedules
  const { data: evaluators } = useEvalutors({});
  const {
    data: schedules, // array schedule dari API (atau object {result: [...]})
    onCreate: createSchedule,
    onCreateLoading,
  } = useScheduleEvaluators({});

  // hook delete time
  const { onDelete: deleteDay } = useDeleteDay();

  // evaluator terpilih
  const [selectedEvaluator, setSelectedEvaluator] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // state jadwal UI
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    createEmptySchedule()
  );

  // kolom table → onClick kirim id evaluator
  const columns = useMemo(
    () =>
      EvaluatorColumns({
        onDelete: () => {},
        onEdit: () => {},
        onClick: (id: string) => {
          const row = (evaluators ?? []).find((x: any) => x.id === id);
          setSelectedEvaluator({
            id,
            name: row?.name ?? row?.email ?? "Evaluator",
          });
          setOpen(true);
        },
      }),
    [evaluators]
  );

  // Saat drawer dibuka & schedules tersedia → isi form dari data API
  useEffect(() => {
    if (!open || !selectedEvaluator?.id) return;

    setLoadingInit(true);

    // toleran: schedules bisa array langsung atau {result: [...]}
    const list: any[] = Array.isArray(schedules)
      ? schedules
      : Array.isArray((schedules as any)?.result)
      ? (schedules as any).result
      : [];

    const mine = list.filter(
      (s: any) => s.evaluator_id === selectedEvaluator.id
    );

    const picked =
      mine.length === 0
        ? undefined
        : mine.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

    setSchedule(fromApiToUi(picked));
    setLoadingInit(false);
  }, [open, selectedEvaluator?.id, schedules]);

  // helper immutable update
  const updateSchedule = (updater: (prev: DaySchedule[]) => DaySchedule[]) =>
    setSchedule((prev) => updater(prev));

  const handleCloseDrawer = () => {
    setOpen(false);
    setSelectedEvaluator(null);
    setSchedule(createEmptySchedule());
  };

  const handleCheckboxChange = async (day: DayEng, checked: boolean) => {
    // cari day sekarang
    const current = schedule.find((d) => d.day === day);
    // update UI dulu (optimistic)
    updateSchedule((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              isAvailable: checked,
              times: checked
                ? d.times.length
                  ? d.times
                  : [
                      {
                        id: null,
                        day_id: d.day_id ?? null,
                        start: null,
                        end: null,
                      },
                    ]
                : [{ id: null, day_id: null, start: null, end: null }],
            }
          : d
      )
    );

    // kalau user mematikan hari & sudah ada di DB → hit API delete-day
    if (!checked && current?.day_id) {
      try {
        await deleteDay(current.day_id); // <--- kirim dayId
        message.success(`Hari ${day} dihapus dari server`);
        // pastikan day_id dilepas dari state setelah delete sukses
        updateSchedule((prev) =>
          prev.map((d) =>
            d.day === day
              ? {
                  ...d,
                  day_id: null,
                  times: [{ id: null, day_id: null, start: null, end: null }],
                }
              : d
          )
        );
      } catch (e: any) {
        message.error(
          `Gagal hapus hari ${day}: ${e?.message || "Unknown error"}`
        );
        // rollback kecil: hidupkan lagi checkbox
        updateSchedule((prev) =>
          prev.map((d) => (d.day === day ? { ...d, isAvailable: true } : d))
        );
      }
    }
  };

  const handleTimeChange = (
    day: DayEng,
    index: number,
    field: "start" | "end",
    value: Dayjs | null
  ) => {
    updateSchedule((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              times: d.times.map((t, i) =>
                i === index
                  ? { ...t, [field]: value ? value.format(TIME_FMT) : null }
                  : t
              ),
            }
          : d
      )
    );
  };

  const addTimeSlot = (day: DayEng) => {
    updateSchedule((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              times: [
                ...d.times,
                { id: null, day_id: d.day_id ?? null, start: null, end: null },
              ],
            }
          : d
      )
    );
  };

  // HAPUS satu slot waktu (pakai hook useDeleteDay jika slot sudah punya id dari DB)
  const removeTimeSlot = async (day: DayEng, index: number) => {
    const current = schedule.find((s) => s.day === day);
    if (!current) return;

    const slot = current.times[index];
    const isPersisted = !!slot?.id;

    // kalau sudah ada di DB → panggil API hapus dulu
    if (isPersisted && slot?.id) {
      try {
        setLoading(true);
        await deleteDay(slot.id as string); // diasumsikan argumen = time_id
      } catch (e: any) {
        message.error(
          "Gagal menghapus waktu: " + (e?.message || "Unknown error")
        );
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    // lalu update state lokal
    updateSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const next = d.times.filter((_, i) => i !== index);
        return {
          ...d,
          times: next.length
            ? next
            : [{ id: null, day_id: d.day_id ?? null, start: null, end: null }],
        };
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedEvaluator?.id) {
      message.error("Evaluator belum dipilih.");
      return;
    }

    setLoading(true);
    try {
      // validasi sederhana
      const invalid = schedule.some(
        (d) =>
          d.isAvailable &&
          d.times.some(
            (t) =>
              !t.start ||
              !t.end ||
              dayjs(t.end, TIME_FMT).isBefore(dayjs(t.start, TIME_FMT))
          )
      );
      if (invalid) {
        message.error("Make sure each slot has a valid start & end time.");
        return;
      }

      // Bentuk payload Prisma Create (nested)
      // Catatan: kita hanya CREATE times baru (yang belum punya id).
      const daysCreate = schedule
        .filter((d) => d.isAvailable) // hanya hari aktif
        .map((d) => {
          const timesCreate = d.times
            .filter((t) => t.start && t.end) // hanya slot valid
            .map((t) => ({
              startTime: hmToISO(t.start as string),
              endTime: hmToISO(t.end as string),
            }));

          // kalau tidak ada slot valid, jangan kirim hari ini
          if (timesCreate.length === 0) return null;

          return {
            day: d.day,
            isAvailable: true,
            times: { create: timesCreate },
          };
        })
        .filter(Boolean) as any[];

      const payload = {
        evaluator_id: selectedEvaluator.id,
        days: daysCreate.length ? { create: daysCreate } : undefined,
      };

      await createSchedule(payload as any);

      message.success("Jadwal disimpan!");
      setOpen(false);
    } catch (error) {
      message.error("Gagal menyimpan jadwal. " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(
    () => `Jadwal ${selectedEvaluator?.name ?? ""}`,
    [selectedEvaluator?.name]
  );

  return (
    <div style={{ padding: 16 }}>
      <Title level={4}>Schedule</Title>
      <Table
        columns={columns}
        dataSource={evaluators}
        loading={loading}
        rowKey="id"
      />

      <Drawer
        placement="right"
        width={520}
        title={title}
        open={open}
        onClose={handleCloseDrawer}
        destroyOnClose
      >
        {loadingInit ? (
          <LoadingSplash />
        ) : selectedEvaluator ? (
          <Form layout="vertical" onFinish={handleSubmit}>
            {schedule.map((item) => (
              <Form.Item key={item.day} style={{ marginBottom: 20 }}>
                <Checkbox
                  checked={item.isAvailable}
                  onChange={(e) =>
                    handleCheckboxChange(item.day, e.target.checked)
                  }
                >
                  {item.day}
                </Checkbox>

                {item.isAvailable && (
                  <div style={{ marginTop: 16 }}>
                    {item.times.map((time, index) => (
                      <Space
                        key={`${item.day}-${index}`}
                        size="middle"
                        align="start"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <TimePicker
                          value={
                            time.start ? dayjs(time.start, TIME_FMT) : null
                          }
                          onChange={(v) =>
                            handleTimeChange(item.day, index, "start", v)
                          }
                          format={TIME_FMT}
                          placeholder="Start"
                          style={{ width: 120 }}
                          disabled={loading}
                        />
                        -
                        <TimePicker
                          value={time.end ? dayjs(time.end, TIME_FMT) : null}
                          onChange={(v) =>
                            handleTimeChange(item.day, index, "end", v)
                          }
                          format={TIME_FMT}
                          placeholder="End"
                          style={{ width: 120 }}
                          disabled={loading}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeTimeSlot(item.day, index)}
                          loading={loading && !!time.id}
                          title={
                            time.id
                              ? "Hapus slot (akan menghapus di database)"
                              : "Hapus slot (belum tersimpan)"
                          }
                        />
                      </Space>
                    ))}

                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => addTimeSlot(item.day)}
                      disabled={loading}
                    >
                      Add Time
                    </Button>
                  </div>
                )}
              </Form.Item>
            ))}

            <Form.Item style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading || onCreateLoading}
              >
                Save Schedule
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <LoadingSplash />
        )}
      </Drawer>
    </div>
  );
}
