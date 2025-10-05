// services/available-schedule.ts
import db from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(tz);

/** Atur timezone kerja evaluator (bisa diambil dari DB per evaluator) */
const TZ = "Asia/Makassar";

/** Durasi default jika belum punya end_time di ScheduleInterview */
const INTERVIEW_SLOT_MINUTES = 30;

type Interval = { start: Date; end: Date };
type DayAvail = { day: string; slots: Interval[] };

function isOverlap(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}

function subtractIntervals(slot: Interval, busies: Interval[]): Interval[] {
  const busySorted = [...busies].sort((x, y) => +x.start - +y.start);
  let pieces: Interval[] = [slot];
  for (const b of busySorted) {
    const next: Interval[] = [];
    for (const p of pieces) {
      if (!isOverlap(p, b)) {
        next.push(p);
        continue;
      }
      if (p.start < b.start) next.push({ start: p.start, end: b.start });
      if (b.end < p.end) next.push({ start: b.end, end: p.end });
    }
    pieces = next;
    if (!pieces.length) break;
  }
  return pieces.filter((p) => p.start < p.end);
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (!intervals.length) return [];
  const sorted = intervals.sort((a, b) => +a.start - +b.start);
  const merged: Interval[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end) {
      prev.end = new Date(Math.max(+prev.end, +cur.end));
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);

/** helper: start-of-day & end-of-day UTC untuk tanggal lokal di TZ */
function dayBoundsUtc(selectedISO: string) {
  const local = dayjs(selectedISO).tz(TZ); // interpret instant dan tampilkan di TZ
  const startUtc = local.startOf("day").utc(); // 00:00 TZ -> UTC instant
  const endUtc = local.endOf("day").utc();
  return { local, startUtc, endUtc };
}

/**
 * Available utk TANGGAL yang dipilih (menghormati TZ):
 * - Filter hari template sesuai nama hari di TZ
 * - Proyeksikan ScheduleTime ke tanggal yang dipilih di TZ
 * - Kurangi dengan interview yang terjadi pada hari itu (range 00:00–24:00 TZ)
 */
export async function GET_AVAILABLE_SCHEDULE(opts: {
  schedule_id: string;
  selected_date: string; // ISO UTC dari FE
}) {
  const { schedule_id, selected_date } = opts;

  // 1) Ambil bounds hari di TZ & nama harinya
  const { local, startUtc, endUtc } = dayBoundsUtc(selected_date);
  const dayName = local.format("dddd"); // "Tuesday", "Wednesday", ...

  // 2) Ambil hari template yang sesuai
  const schedule = await db.scheduleEvaluator.findUnique({
    where: { schedule_id },
    include: {
      days: {
        where: { isAvailable: true, day: dayName },
        include: { times: true },
      },
    },
  });
  if (!schedule) throw new Error("ScheduleEvaluator tidak ditemukan");

  if (!schedule.days.length) {
    return {
      schedule_id,
      evaluator_id: schedule.evaluator_id,
      available: [{ day: dayName, slots: [] }],
      meta: {
        tz: TZ,
        forDateLocal: local.startOf("day").format(),
        interviewSlotMinutes: INTERVIEW_SLOT_MINUTES,
      },
    };
  }

  // 3) Interview yang jatuh pada tanggal itu (range 00:00–24:00 di TZ, dikonversi ke UTC utk query)
  const interviews = await db.scheduleInterview.findMany({
    where: {
      schedule_id,
      start_time: { gte: startUtc.toDate(), lte: endUtc.toDate() },
    },
    select: { start_time: true }, // jika ada end_time, pilih juga
  });

  const busyIntervals: Interval[] = interviews.map((iv) => ({
    start: iv.start_time,
    end: addMinutes(iv.start_time, INTERVIEW_SLOT_MINUTES), // ganti ke iv.end_time jika tersedia
  }));

  // 4) Proyeksikan ScheduleTime ke tanggal lokal terpilih, lalu ke UTC Date
  const day = schedule.days[0];
  const cut = day.times.flatMap((t) => {
    const tStartLocal = dayjs(t.startTime).tz(TZ);
    const tEndLocal = dayjs(t.endTime).tz(TZ);

    const slotLocalStart = local
      .startOf("day")
      .hour(tStartLocal.hour())
      .minute(tStartLocal.minute())
      .second(0)
      .millisecond(0);

    const slotLocalEnd = local
      .startOf("day")
      .hour(tEndLocal.hour())
      .minute(tEndLocal.minute())
      .second(0)
      .millisecond(0);

    const slot: Interval = {
      start: slotLocalStart.utc().toDate(),
      end: slotLocalEnd.utc().toDate(),
    };

    if (!busyIntervals.length) return [slot];
    return subtractIntervals(slot, busyIntervals);
  });

  const merged = mergeIntervals(cut);

  return {
    schedule_id,
    evaluator_id: schedule.evaluator_id,
    available: [{ day: dayName, slots: merged }],
    meta: {
      tz: TZ,
      forDateLocal: local.startOf("day").format(), // untuk debugging
      interviewSlotMinutes: INTERVIEW_SLOT_MINUTES,
    },
  };
}
