import db from "@/lib/prisma";
import { EmployeeSetupAnswerUpdateRequest } from "../models/employee-setup-answer";
import { GeneralError } from "../utils/general-error";

export const UPSERT_EMPLOYEE_SETUP_ANSWER = async ({
  applicantId,
  employeeSetupQuestionId,
  is_done,
  value_link,
  value_text,
  value_file_url,
  notes,
  implementation_date,
}: EmployeeSetupAnswerUpdateRequest) => {
  if (!applicantId || !employeeSetupQuestionId) {
    throw new GeneralError({
      code: 400,
      details: "Missing applicantId or employeeSetupQuestionId",
      error: "INVALID_PAYLOAD",
      error_code: "INVALID_PAYLOAD",
    });
  }

  const existing = await db.employeeSetupAnswer.findFirst({
    where: {
      employeeSetupQuestionId,
      employeeId: applicantId,
    },
  });

  const nextImplementationDate =
    typeof is_done === "boolean"
      ? is_done
        ? implementation_date ?? new Date()
        : null
      : implementation_date ?? existing?.implementation_date ?? null;

  if (existing) {
    return db.employeeSetupAnswer.update({
      where: {
        id: existing.id,
      },
      data: {
        is_done: typeof is_done === "boolean" ? is_done : existing.is_done,
        value_link:
          value_link !== undefined ? value_link : existing.value_link,
        value_text:
          value_text !== undefined ? value_text : existing.value_text,
        value_file_url:
          value_file_url !== undefined
            ? value_file_url
            : existing.value_file_url,
        notes: notes !== undefined ? notes : existing.notes,
        implementation_date: nextImplementationDate,
      },
    });
  }

  return db.employeeSetupAnswer.create({
    data: {
      employeeId: applicantId,
      employeeSetupQuestionId,
      is_done: is_done ?? false,
      value_link: value_link ?? null,
      value_text: value_text ?? null,
      value_file_url: value_file_url ?? null,
      notes: notes ?? null,
      implementation_date: nextImplementationDate,
    },
  });
};
