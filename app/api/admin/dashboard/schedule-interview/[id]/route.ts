// app/api/admin/dashboard/schedule-interview/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UPDATE_SCHEDULE_INTERVIEW } from "@/app/providers/schedule-interview";
import db from "@/lib/prisma";

const emptyToNull = <T extends string | null | undefined>(v: T) =>
  typeof v === "string" && v.trim() === "" ? (null as T) : v;

const isProvided = (v: unknown) =>
  !(v == null || (typeof v === "string" && v.trim() === ""));

const coerceBool = (v: unknown, def = false) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes"].includes(s)) return true;
    if (["false", "0", "no"].includes(s)) return false;
  }
  return def;
};

const coerceDateLike = (v: unknown): string | Date => {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  return v as string | Date;
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const id = params.id;
    if (!isProvided(id)) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    // normalisasi kunci camelCase/snake_case, dukung juga `link`
    const applicantId =
      raw.applicantId ??
      raw.applicant_id ??
      raw.candidateId ??
      raw.candidate_id;
    const scheduleId =
      raw.scheduleId ?? raw.schedule_id ?? raw.locationId ?? raw.location_id;
    const startTimeRaw = raw.startTime ?? raw.start_time;
    const meetingLinkRaw = raw.meetingLink ?? raw.meeting_link ?? raw.link;
    const noteRaw = raw.note ?? null;

    // Ambil data existing untuk melengkapi field yang tidak dikirim (partial update)
    const current = await db.scheduleInterview.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        start_time: true,
        meeting_link: true,
        applicant_id: true,
        schedule_id: true,
      },
    });
    if (!current) {
      return NextResponse.json(
        { success: false, message: "Schedule not found" },
        { status: 404 }
      );
    }

    // Coerce values dengan fallback ke current
    const applicant_id = String(
      isProvided(applicantId) ? applicantId : current.applicant_id
    );
    const schedule_id = String(
      isProvided(scheduleId) ? scheduleId : current.schedule_id
    );

    let date: string | Date = current.date;
    let start_time: string | Date = current.start_time;
    try {
      if (isProvided(raw.date)) date = coerceDateLike(raw.date);
      if (isProvided(startTimeRaw)) start_time = coerceDateLike(startTimeRaw);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "date/start_time is invalid";
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }

    // Tentukan online & meeting_link
    const hasOnline = "online" in raw;
    const online = hasOnline ? coerceBool(raw.online, false) : undefined;
    const hasAnyLinkKey =
      "meeting_link" in raw || "meetingLink" in raw || "link" in raw;
    const meeting_link = hasAnyLinkKey
      ? emptyToNull(meetingLinkRaw)
      : current.meeting_link ?? null;
    const onlineFinal =
      online !== undefined
        ? online
        : Boolean(meeting_link ?? current.meeting_link);

    // Validasi link saat online
    if (onlineFinal && !meeting_link) {
      return NextResponse.json(
        {
          success: false,
          message: "meeting_link is required for online interview",
        },
        { status: 400 }
      );
    }

    const payload = {
      applicant_id,
      schedule_id,
      date,
      start_time,
      is_online: onlineFinal,
      note: emptyToNull(noteRaw),
      meeting_link,
    };

    const result = await UPDATE_SCHEDULE_INTERVIEW(id, payload);

    return NextResponse.json(
      { success: true, message: "Successfully updated schedule!", result },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    if (
      /Invalid interview date|Invalid interview start time|Meeting link is required|Location ID is required/i.test(
        msg
      )
    ) {
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update schedule", error: msg },
      { status: 500 }
    );
  }
};

export const GET = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await db.scheduleInterview.findUnique({
      where: { id: params.id },
      include: {
        schedule: {
          include: {
            evaluator: true,
          },
        },
        applicant: {
          include: {
            user: true,
            job: {
              include: { location: true },
            },
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Successfully get data!", result: data },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: "Failed to get data", error: msg },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const result = await db.scheduleInterview.delete({
      where: { id: params.id },
    });
    return NextResponse.json(
      { success: true, message: "Successfully deleted!", result },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: "Failed to delete schedule", error: msg },
      { status: 500 }
    );
  }
};
