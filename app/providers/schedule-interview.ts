// services/interview.ts
import dayjs, { Dayjs } from "dayjs";
import db from "@/lib/prisma";
import { sendRecruitmentEmail } from "../vendor/send-email";
import { sendWhatsAppMessage } from "../vendor/send-message-helper";
import { createZoomMeeting } from "../vendor/meeting-helper";

/* =========================
   Types
========================= */
type RawPayload = {
  applicant_id: string;
  schedule_id: string; // <-- baru: terhubung ke ScheduleEvaluator.schedule_id
  date: Dayjs | string | Date; // tanggal interview (tanpa jam)
  start_time: Dayjs | string | Date; // jam mulai (nempel ke date)
  is_online: boolean; // sesuai schema
  note?: string | null; // opsional (aktifkan di DB kalau mau simpan)
};

type CreateData = {
  applicant_id: string;
  schedule_id: string;
  date: Date; // 00:00 UTC (Prisma DateTime)
  start_time: Date; // date + time
  is_online: boolean;
  meeting_link: string | null;
};

/* =========================
   Helpers
========================= */
function normalizePayload(input: RawPayload): CreateData {
  const d = dayjs(input.date);
  const t = dayjs(input.start_time);

  if (!input.applicant_id) throw new Error("Applicant ID is required.");
  if (!input.schedule_id) throw new Error("Schedule ID is required.");
  if (!d.isValid()) throw new Error("Invalid interview date");
  if (!t.isValid()) throw new Error("Invalid interview start time");

  // dateOnly diset ke awal hari; start_time = dateOnly + jam dari t
  const dateOnly = d.startOf("day");
  const startAt = dateOnly
    .hour(t.hour())
    .minute(t.minute())
    .second(t.second() || 0)
    .millisecond(0);

  const is_online = Boolean(input.is_online);
  return {
    applicant_id: String(input.applicant_id),
    schedule_id: String(input.schedule_id),
    date: dateOnly.toDate(),
    start_time: startAt.toDate(),
    is_online,
    meeting_link: null,
  };
}

/** Cek konflik slot: asumsikan unik di (schedule_id, date, start_time) */
async function ensureNoConflictSlot(args: {
  schedule_id: string;
  date: Date;
  start_time: Date;
  excludeId?: string; // untuk update
}) {
  const { schedule_id, date, start_time, excludeId } = args;

  const conflict = await db.scheduleInterview.findFirst({
    where: {
      schedule_id,
      date,
      start_time,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    throw new Error("Selected slot is already booked for this schedule.");
  }
}

/* =========================
   Main service
========================= */
export const CREATE_SCHEDULE_INTERVIEW = async (payload: RawPayload) => {
  const data = normalizePayload(payload);

  // Pastikan schedule evaluator ada
  const schedule = await db.scheduleEvaluator.findUnique({
    where: { schedule_id: data.schedule_id },
    select: { schedule_id: true, evaluator_id: true },
  });
  if (!schedule) {
    throw new Error("ScheduleEvaluator not found.");
  }

  // Cek konflik slot pada schedule ini
  await ensureNoConflictSlot({
    schedule_id: data.schedule_id,
    date: data.date,
    start_time: data.start_time,
  });

  const username = await db.user.findFirst({
    where: { Applicant: { some: { id: data.applicant_id } } },
    select: { name: true },
  });

  if (data.is_online) {
    const meetingLink = await createZoomMeeting(
      `Interview Meeting ${username?.name ?? "Candidate"}`,
      dayjs(data.start_time).toDate()
    );
    data.meeting_link = meetingLink;
  }

  const result = await db.scheduleInterview.create({
    data: {
      applicant: { connect: { id: data.applicant_id } },
      schedule: { connect: { schedule_id: data.schedule_id } }, // <-- relasi ke ScheduleEvaluator
      date: data.date,
      start_time: data.start_time,
      is_online: data.is_online,
      meeting_link: data.meeting_link || null,

      // note: data.note, // aktifkan kalau kamu tambahkan kolom di schema
    },
    include: {
      applicant: { include: { user: true, job: true } }, // ambil job judul untuk email/WA
      schedule: { select: { evaluator_id: true } },
    },
  });

  // Notifikasi (best-effort)
  try {
    const { applicant, is_online, meeting_link, start_time } = result;

    const name = applicant.user?.name ?? "Candidate";
    const email = applicant.user?.email ?? null;
    const phone = applicant.user?.phone ?? null;
    const jobTitle = applicant.job?.job_title ?? "Interview";

    const dateText = dayjs(start_time).format("dddd, DD MMM YYYY");
    const timeText = dayjs(start_time).format("HH:mm");

    if (email) {
      await sendRecruitmentEmail(email, name, {
        type: "interview",
        jobTitle,
        date: result.date,
        time: start_time,
        online: is_online,
        meetingLink: is_online ? meeting_link ?? undefined : undefined,
      });
    }

    if (phone) {
      const waMessage = is_online
        ? [
            `Hello ${name},`,
            `You are scheduled for an *online* interview for the *${jobTitle}* position.`,
            `🗓️ Date: ${dateText}`,
            `🕘 Time: ${timeText} (WITA)`,
            `🔗 Meeting link: ${meeting_link}`,
            ``,
            `Please join 5 minutes early.`,
            `If you need to reschedule, reply to this message.`,
            `Thank you!`,
          ].join("\n")
        : [
            `Hello ${name},`,
            `You are scheduled for an *offline* interview for the *${jobTitle}* position.`,
            `🗓️ Date: ${dateText}`,
            `🕘 Time: ${timeText} (WITA)`,
            ``,
            `Please arrive 10 minutes early.`,
            `If you need to reschedule, reply to this message.`,
            `Thank you!`,
          ].join("\n");

      await sendWhatsAppMessage(phone, waMessage);
    }
  } catch (err) {
    console.error("Failed to send interview notifications:", err);
  }

  return result;
};

export const GET_SCHEDULES_BY_APPLICANT = async (applicantId: string) => {
  return db.scheduleInterview.findMany({
    where: { applicant_id: applicantId },
    include: {
      applicant: { include: { user: true, job: true } },
      schedule: true,
    },
    orderBy: [{ date: "desc" }, { start_time: "desc" }],
  });
};

export const UPDATE_SCHEDULE_INTERVIEW = async (
  id: string,
  payload: RawPayload
) => {
  const data = normalizePayload(payload);

  // Pastikan schedule evaluator ada
  const schedule = await db.scheduleEvaluator.findUnique({
    where: { schedule_id: data.schedule_id },
    select: { schedule_id: true },
  });
  if (!schedule) {
    throw new Error("ScheduleEvaluator not found.");
  }

  // Cek konflik slot (kecuali dirinya sendiri)
  await ensureNoConflictSlot({
    schedule_id: data.schedule_id,
    date: data.date,
    start_time: data.start_time,
    excludeId: id,
  });

  return db.scheduleInterview.update({
    where: { id },
    data: {
      applicant: { connect: { id: data.applicant_id } },
      schedule: { connect: { schedule_id: data.schedule_id } },
      date: data.date,
      start_time: data.start_time,
      is_online: data.is_online,
      meeting_link: data.meeting_link,
    },
    include: {
      applicant: { include: { user: true, job: true } },
      schedule: { select: { evaluator_id: true } },
    },
  });
};

export const GET_SCHEDULE_INTERVIEWS = async () => {
  return db.scheduleInterview.findMany({
    include: {
      applicant: { include: { user: true, job: true } },
      schedule: true,
    },
    orderBy: [{ date: "desc" }, { start_time: "desc" }],
  });
};
