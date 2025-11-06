import { JobPayloadUpdateModel } from "@/app/models/job";
import { DELETE_JOB, GET_JOB, UPDATE_JOB } from "@/app/providers/job";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

const buildUpdatePayload = (body: JobPayloadUpdateModel) => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const data: JobPayloadUpdateModel = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.location_id !== undefined) data.location_id = body.location_id;
  if (body.is_published !== undefined)
    data.is_published = Boolean(body.is_published);
  if (body.type_job !== undefined) {
    const normalizedType =
      body.type_job === "REFFERAL" ? "REFFERAL" : "TEAM_MEMBER";
    data.type_job = normalizedType;
    if (normalizedType === "REFFERAL") {
      data.show_salary = false;
      data.work_type = body.work_type ?? "ONSITE";
      data.employment = body.employment ?? "FULL_TIME";
    }
  }
  if (body.salary !== undefined) {
    if (body.salary === null || body.salary === "") {
      throw new Error("Salary cannot be empty");
    }
    data.salary = body.salary.toString();
  }
  if (body.show_salary !== undefined) {
    const isReferral =
      (data.type_job ?? body.type_job) === "REFFERAL";
    data.show_salary = isReferral ? false : Boolean(body.show_salary);
  }
  if (body.work_type !== undefined) {
    data.work_type = body.work_type;
  }
  if (body.employment !== undefined) {
    data.employment = body.employment;
  }
  if (body.until_at !== undefined) {
    let until: Date;
    if (
      typeof body.until_at === "string" ||
      typeof body.until_at === "number" ||
      body.until_at instanceof Date
    ) {
      until = new Date(body.until_at);
    } else {
      throw new Error("Invalid until_at value type");
    }
    if (Number.isNaN(until.getTime())) {
      throw new Error("Invalid until_at value");
    }
    data.until_at = until;
  }

  return data;
};


export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await GET_JOB(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get job!",
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
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const body = await req.json();
    const payload = buildUpdatePayload(body);

    const data = await UPDATE_JOB(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated!",
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
          error instanceof Error ? error.message : "Failed to update job",
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await DELETE_JOB(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted!",
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
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const body = await req.json();
    if (typeof body?.is_published !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "is_published must be a boolean value",
        },
        { status: 400 }
      );
    }

    const data = await UPDATE_JOB(id, { is_published: body.is_published });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated!",
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
          error instanceof Error ? error.message : "Failed to update job",
      },
      { status: 500 }
    );
  }
};
