import { JobPayloadCreateModel } from "@/app/models/job";
import { CREATE_JOB, GET_JOBS } from "@/app/providers/job";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

const parseCreatePayload = (body: any): JobPayloadCreateModel => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const {
    name,
    description,
    until_at,
    location_id,
    is_published,
    salary,
    work_type,
    employment,
    show_salary,
    type_job,
  } = body;

  if (!name) throw new Error("Name is required");
  if (!description) throw new Error("Description is required");
  if (!location_id) throw new Error("Location is required");
  if (!until_at) throw new Error("Until_at is required");
  if (!type_job) throw new Error("Job type is required");

  const normalizedType =
    type_job === "REFFERAL" ? "REFFERAL" : "TEAM_MEMBER";

  if (
    normalizedType === "TEAM_MEMBER" &&
    (salary === undefined || salary === null || salary === "")
  ) {
    throw new Error("Salary is required");
  }

  if (normalizedType === "TEAM_MEMBER") {
    if (!work_type) throw new Error("Work type is required");
    if (!employment) throw new Error("Employment type is required");
  }

  const untilAtDate = new Date(until_at);
  if (Number.isNaN(untilAtDate.getTime())) {
    throw new Error("Invalid until_at value");
  }

  const workTypeValue = work_type ?? "ONSITE";
  const employmentValue = employment ?? "FULL_TIME";

  return {
    name,
    description,
    location_id,
    until_at: untilAtDate,
    is_published: Boolean(is_published),
    salary:
      normalizedType === "TEAM_MEMBER"
        ? salary?.toString() ?? ""
        : "",
    type_job: normalizedType,
    work_type: workTypeValue,
    employment: employmentValue,
    show_salary:
      normalizedType === "REFFERAL" ? false : Boolean(show_salary),
  } as JobPayloadCreateModel;
};

export const GET = async (req: NextRequest) => {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const filter =
      status === "active"
        ? { is_published: true }
        : status === "inactive"
        ? { is_published: false }
        : undefined;

    const data = await GET_JOBS(filter);
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.error,
          error_code: error.error_code,
          details: error.details,
        },
        { status: error.code }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get job data",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const payload = parseCreatePayload(body);

    const data = await CREATE_JOB(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.error,
          error_code: error.error_code,
          details: error.details,
        },
        { status: error.code }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create job",
      },
      { status: 500 }
    );
  }
};
