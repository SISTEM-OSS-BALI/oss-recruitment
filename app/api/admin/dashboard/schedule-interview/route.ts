// app/api/admin/dashboard/schedule-interview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CREATE_SCHEDULE_INTERVIEW } from "@/app/providers/interview";

const emptyToNull = <T extends string | null | undefined>(v: T) =>
  typeof v === "string" && v.trim() === "" ? (null as T) : v;

const isProvided = (v: unknown) =>
  !(
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "")
  );

const coerceBool = (v: unknown, def = false) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  return def;
};

const coerceDateLike = (v: unknown): string | Date => {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  return v as string | Date;
};

export const POST = async (req: NextRequest) => {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // normalisasi nama field: terima camelCase ataupun snake_case
    const candidateId = raw.candidateId ?? raw.candidate_id;
    const locationId = raw.locationId ?? raw.location_id;
    const startTime = raw.startTime ?? raw.start_time;
    const meetingLink = raw.meetingLink ?? raw.meeting_link ?? raw.link;
    const note = raw.note ?? null;

    if (!isProvided(candidateId)) {
      return NextResponse.json(
        { success: false, message: "candidate_id is required" },
        { status: 400 }
      );
    }
    if (!isProvided(raw.date)) {
      return NextResponse.json(
        { success: false, message: "date is required" },
        { status: 400 }
      );
    }
    if (!isProvided(startTime)) {
      return NextResponse.json(
        { success: false, message: "start_time is required" },
        { status: 400 }
      );
    }
    if (!isProvided(locationId)) {
      return NextResponse.json(
        { success: false, message: "location_id is required" },
        { status: 400 }
      );
    }

    const online = coerceBool(raw.online, false);

    let date: string | Date;
    let start_time: string | Date;
    try {
      date = coerceDateLike(raw.date);
      start_time = coerceDateLike(startTime);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "date/start_time is invalid";
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }

    const normalizedPayload = {
      candidate_id: String(candidateId),
      location_id: String(locationId),
      date,
      start_time,
      online,
      note: emptyToNull(note),
      meeting_link: emptyToNull(meetingLink),
      // link tidak perlu jika sudah ada meeting_link
    };

    const result = await CREATE_SCHEDULE_INTERVIEW(normalizedPayload);

    return NextResponse.json(
      { success: true, message: "Successfully scheduled interview!", result },
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
      { success: false, message: "Failed to create schedule", error: msg },
      { status: 500 }
    );
  }
};
