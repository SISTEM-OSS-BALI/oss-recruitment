import { JobPayloadUpdateModel } from "@/app/models/job";
import { DELETE_JOB, GET_JOB, UPDATE_JOB } from "@/app/providers/job";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";
import { EmploymentType, TypeJob, WorkType } from "@prisma/client";

const EMPLOYMENT_VALUES = Object.values(EmploymentType);
const WORK_TYPE_VALUES = Object.values(WorkType);
const TYPE_JOB_VALUES = Object.values(TypeJob);

type SalaryInput =
  | number
  | string
  | { min?: number | string; max?: number | string };

type DescriptionInput =
  | string
  | {
      summary?: string;
      responsibilities?: string[] | string;
      nice_to_have?: string[] | string;
    };

const sanitizeNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const isEmploymentType = (value: unknown): value is EmploymentType =>
  typeof value === "string" && EMPLOYMENT_VALUES.includes(value as EmploymentType);

const isWorkType = (value: unknown): value is WorkType =>
  typeof value === "string" && WORK_TYPE_VALUES.includes(value as WorkType);

const isTypeJob = (value: unknown): value is TypeJob =>
  typeof value === "string" && TYPE_JOB_VALUES.includes(value as TypeJob);

const normalizeStringList = (value: string[] | string | undefined) => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }
  if (typeof value === "string") {
    const normalized = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }
  return undefined;
};

const normalizeDescription = (value: DescriptionInput) => {
  if (typeof value === "string") {
    const summary = value.trim();
    if (!summary) {
      throw new Error("Job summary is required");
    }
    return {
      summary,
      sections: {
        summary,
      },
    };
  }

  if (value && typeof value === "object") {
    const summary = typeof value.summary === "string" ? value.summary.trim() : "";
    if (!summary) {
      throw new Error("Job summary is required");
    }

    return {
      summary,
      sections: {
        summary,
        responsibilities: normalizeStringList(value.responsibilities),
        nice_to_have: normalizeStringList(value.nice_to_have),
      },
    };
  }

  throw new Error("Description is required");
};

const normalizeSalary = (
  salary: SalaryInput | undefined,
  fallbackMin: unknown,
  fallbackMax: unknown,
  type: TypeJob
) => {
  if (type === "REFFERAL") {
    return { min: 0, max: 0 };
  }

  if (typeof salary === "number" || typeof salary === "string") {
    const numeric = sanitizeNumber(salary);
    if (numeric === undefined) {
      throw new Error("Salary is required");
    }
    return { min: numeric, max: numeric };
  }

  if (
    salary === undefined &&
    fallbackMin === undefined &&
    fallbackMax === undefined
  ) {
    return undefined;
  }

  const minValue = sanitizeNumber(salary?.min ?? fallbackMin);
  const maxValue = sanitizeNumber(salary?.max ?? fallbackMax);

  if (minValue === undefined || maxValue === undefined) {
    throw new Error("Salary range (min & max) is required");
  }
  if (minValue < 0 || maxValue < 0) {
    throw new Error("Salary cannot be negative");
  }
  if (minValue > maxValue) {
    throw new Error("Minimum salary cannot exceed maximum salary");
  }

  return { min: minValue, max: maxValue };
};

const buildUpdatePayload = (
  body: JobPayloadUpdateModel,
  currentType?: TypeJob,
  currentIsDraft?: boolean
) => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const data: JobPayloadUpdateModel = {};
  const resolvedDraftStatus =
    body.is_draft !== undefined
      ? Boolean(body.is_draft)
      : Boolean(currentIsDraft);

  if (body.job_title !== undefined) {
    if (typeof body.job_title !== "string") {
      throw new Error("Job title must be a string");
    }
    const trimmedTitle = body.job_title.trim();
    if (!trimmedTitle && !resolvedDraftStatus) {
      throw new Error("Job title is required");
    }
    data.job_title = trimmedTitle;
  }
  if (body.job_role !== undefined) {
    if (typeof body.job_role !== "string") {
      throw new Error("Job role must be a string");
    }
    const trimmedRole = body.job_role.trim();
    if (!trimmedRole && !resolvedDraftStatus) {
      throw new Error("Job role is required");
    }
    data.job_role = trimmedRole;
  }
  const shouldUpdateDescription =
    body.description !== undefined ||
    (body.description_sections !== undefined &&
      body.description_sections !== null);

  if (shouldUpdateDescription) {
    try {
      const normalized = normalizeDescription(
        (body.description_sections ?? body.description) as DescriptionInput
      );
      data.description = normalized.summary;
      data.description_sections = normalized.sections;
    } catch (error) {
      if (!resolvedDraftStatus) {
        throw error;
      }
      const fallbackSummary =
        (typeof body.description === "string"
          ? body.description.trim()
          : "") ||
        (typeof body.job_title === "string"
          ? body.job_title.trim()
          : "") ||
        "Draft Job";
      data.description = fallbackSummary;
      data.description_sections = {
        summary: fallbackSummary,
      };
    }
  }
  if (body.requirement !== undefined) {
    data.requirement =
      body.requirement && typeof body.requirement === "object"
        ? body.requirement
        : null;
  }
  if (body.location_id !== undefined) {
    if (
      typeof body.location_id === "string" ||
      body.location_id === null
    ) {
      data.location_id = body.location_id as string | null;
    } else if (!resolvedDraftStatus) {
      throw new Error("Invalid location_id value");
    } else {
      data.location_id = null;
    }
  }
  if (body.is_published !== undefined) {
    data.is_published = Boolean(body.is_published);
  }
  if (body.is_have_domicile !== undefined) {
    data.is_have_domicile = Boolean(body.is_have_domicile);
  }
  if (body.step !== undefined) {
    if (!Number.isFinite(Number(body.step))) {
      throw new Error("Invalid step value");
    }
    data.step = Number(body.step);
  }
  if (body.is_draft !== undefined) {
    data.is_draft = Boolean(body.is_draft);
  }
  if (body.user_id !== undefined) {
    data.user_id = typeof body.user_id === "string" ? body.user_id : null;
  }

  if (body.type_job !== undefined) {
    if (!isTypeJob(body.type_job)) {
      throw new Error("Invalid job type value");
    }
    data.type_job = body.type_job;
  }

  const resolvedType = (data.type_job ?? body.type_job ?? currentType ?? "TEAM_MEMBER") as TypeJob;

  if (body.arrangement !== undefined) {
    if (!isWorkType(body.arrangement)) {
      throw new Error("Invalid arrangement value");
    }
    data.arrangement = body.arrangement;
  }
  if (body.commitment !== undefined) {
    if (!isEmploymentType(body.commitment)) {
      throw new Error("Invalid commitment value");
    }
    data.commitment = body.commitment;
  }

  let salaryRange: { min: number; max: number } | undefined;
  try {
    salaryRange = normalizeSalary(
      body.salary as SalaryInput,
      body.salary_min,
      body.salary_max,
      resolvedType
    );
  } catch (error) {
    if (!resolvedDraftStatus) {
      throw error;
    }
    salaryRange = { min: 0, max: 0 };
  }
  if (salaryRange) {
    data.salary_min = salaryRange.min;
    data.salary_max = salaryRange.max;
  }

  if (body.show_salary !== undefined) {
    data.show_salary =
      resolvedType === "REFFERAL" ? false : Boolean(body.show_salary);
  }

  if (body.description_sections === null) {
    data.description_sections = null;
  }
  if (body.requirement === null) {
    data.requirement = null;
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
      if (!resolvedDraftStatus) {
        throw new Error("Invalid until_at value type");
      }
      return data;
    }
    if (Number.isNaN(until.getTime())) {
      if (!resolvedDraftStatus) {
        throw new Error("Invalid until_at value");
      }
      return data;
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
    const existing = await GET_JOB(id);
    const payload = buildUpdatePayload(
      body,
      existing?.type_job as TypeJob,
      existing?.is_draft
    );

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
