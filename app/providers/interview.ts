// services/interview.ts
import dayjs, { Dayjs } from "dayjs";
import db from "@/lib/prisma";
import { sendRecruitmentEmail } from "../utils/send-email";
import { sendWhatsAppMessage } from "../utils/send-message-helper";

/* =========================
   Types
========================= */
type RawPayload = {
  candidate_id: string;
  date: Dayjs | string | Date;
  start_time: Dayjs | string | Date;
  online: boolean;
  note?: string | null;
  location_id: string; // REQUIRED by schema
  link?: string | null;
  meeting_link?: string | null;
};

type CreateData = {
  candidate_id: string;
  date: Date; // date-only (00:00)
  start_time: Date; // full datetime = date + time
  location_id: string; // REQUIRED
  meeting_link: string | null; // optional
};

/* =========================
   Helpers
========================= */
function normalizePayload(input: RawPayload): CreateData {
  const d = dayjs(input.date);
  const t = dayjs(input.start_time);

  if (!d.isValid()) throw new Error("Invalid interview date");
  if (!t.isValid()) throw new Error("Invalid interview start time");

  const dateOnly = d.startOf("day");
  const startAt = dateOnly
    .hour(t.hour())
    .minute(t.minute())
    .second(t.second() || 0)
    .millisecond(0);

  const online = Boolean(input.online);
  const link = (input.meeting_link ?? input.link ?? "").trim();

  if (online && !link) {
    throw new Error("Meeting link is required for an online interview.");
  }

  if (!input.location_id || typeof input.location_id !== "string") {
    throw new Error("Location ID is required.");
  }

  return {
    candidate_id: String(input.candidate_id),
    date: dateOnly.toDate(),
    start_time: startAt.toDate(),
    location_id: input.location_id,
    meeting_link: online ? link : null,
  };
}

/* =========================
   Main service
========================= */
export const CREATE_SCHEDULE_INTERVIEW = async (payload: RawPayload) => {
  // 1) Normalize input for DB
  const data = normalizePayload(payload);

  // 2) Create and include related entities for notifications/UI
  const result = await db.scheduleInterview.create({
    data: {
      // relasi pakai connect (tidak lagi mengirim scalar langsung)
      candidate: { connect: { id: data.candidate_id } },
      location: { connect: { id: data.location_id } },

      date: data.date,
      start_time: data.start_time,
      meeting_link: data.meeting_link,
    },
    include: {
      candidate: { include: { job: true } },
      location: true,
    },
  });

  // 3) Notifications
  const { candidate, location, meeting_link, date, start_time } = result;
  const isOnline = Boolean(meeting_link);

  if (candidate?.email && candidate?.name && candidate?.phone) {
    const position = candidate.job?.name ?? "Interview";

    try {
      // Email
      await sendRecruitmentEmail(candidate.email, candidate.name, {
        type: "interview",
        jobTitle: position,
        date,
        time: start_time,
        online: isOnline,
        meetingLink: isOnline ? meeting_link ?? undefined : undefined,
        location: !isOnline ? location?.name : undefined, // label only
        // If you later add fields in your email template, you can pass:
        // locationAddress: !isOnline ? location?.address : undefined,
        // mapsUrl: !isOnline ? location?.maps_url : undefined,
      });

      // WhatsApp
      const dateText = dayjs(start_time).format("dddd, DD MMM YYYY");
      const timeText = dayjs(start_time).format("HH:mm");

      const waMessage = isOnline
        ? [
            `Hello ${candidate.name},`,
            `You are scheduled for an *online* interview for the *${position}* position.`,
            `🗓️ Date: ${dateText}`,
            `🕘 Time: ${timeText} (WITA)`,
            `🔗 Meeting link: ${meeting_link}`,
            ``,
            `Please join 5 minutes early.`,
            `If you need to reschedule, reply to this message.`,
            `Thank you!`,
          ].join("\n")
        : [
            `Hello ${candidate.name},`,
            `You are scheduled for an *offline* interview for the *${position}* position.`,
            `🗓️ Date: ${dateText}`,
            `🕘 Time: ${timeText} (WITA)`,
            `🏢 Venue: ${location?.address ?? "-"}`,
            `📍 Maps: ${location?.maps_url ?? "-"}`,
            ``,
            `Please arrive 10 minutes early.`,
            `If you need to reschedule, reply to this message.`,
            `Thank you!`,
          ].join("\n");

      await sendWhatsAppMessage(candidate.phone, waMessage);
    } catch (err) {
      // Do not fail the creation if notifications fail
      console.error("Failed to send interview notifications:", err);
    }
  }

  return result;
};

export const GET_SCHEDULES_BY_CANDIDATE = async (candidateId: string) => {
  return db.scheduleInterview.findMany({
    where: { candidateId: candidateId },
    include: {
      location: true,
      candidate: {
        include: {
          job: {
            include: {
              location: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });
};

export const UPDATE_SCHEDULE_INTERVIEW = async (
  id: string,
  payload: RawPayload
) => {
  const data = normalizePayload(payload);
  return db.scheduleInterview.update({
    where: { id },
    data: {
      candidate: { connect: { id: data.candidate_id } },
      location: { connect: { id: data.location_id } },
      date: data.date,
      start_time: data.start_time,
      meeting_link: data.meeting_link,
    },
    include: {
      candidate: { include: { job: true } },
      location: true,
    },
  });
};
