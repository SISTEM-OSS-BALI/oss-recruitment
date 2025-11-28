import { db } from "@/lib/prisma";
import { AssignEmployeeSetupPayload } from "../models/applicant-employee-setup";

const buildAssignmentInclude = (applicantId: string) => ({
  employeeSetup: {
    include: {
      employeeSetupQuestion: {
        orderBy: [{ createdAt: 'asc' as const }],
        include: {
          employeeSetupAnswers: {
            where: {
              employeeId: applicantId,
            },
          },
        },
      },
    },
  },
});

export const GET_APPLICANT_EMPLOYEE_SETUPS = async (
  applicantId: string
) => {
  if (!applicantId) return [];

  return db.applicantEmployeeSetup.findMany({
    where: { applicantId },
    include: buildAssignmentInclude(applicantId),
  });
};

export const UPSERT_APPLICANT_EMPLOYEE_SETUPS = async ({
  applicantId,
  employeeSetupIds,
}: AssignEmployeeSetupPayload) => {
  if (!applicantId) return [];

  const normalizedIds = Array.from(new Set(employeeSetupIds ?? []));

  return db.$transaction(async (tx) => {
    const existing = await tx.applicantEmployeeSetup.findMany({
      where: { applicantId },
      select: { id: true, employeeSetupId: true },
    });

    const toRemove = existing.filter(
      (item) => !normalizedIds.includes(item.employeeSetupId)
    );
    const toAdd = normalizedIds.filter(
      (id) => !existing.some((item) => item.employeeSetupId === id)
    );

    if (toRemove.length) {
      const removedSetupIds = toRemove.map((item) => item.employeeSetupId);
      const questionIds = await tx.employeeSetupQuestion.findMany({
        where: { employeeSetupId: { in: removedSetupIds } },
        select: { id: true },
      });

      if (questionIds.length) {
        await tx.employeeSetupAnswer.deleteMany({
          where: {
            employeeId: applicantId,
            employeeSetupQuestionId: {
              in: questionIds.map((question) => question.id),
            },
          },
        });
      }

      await tx.applicantEmployeeSetup.deleteMany({
        where: { id: { in: toRemove.map((item) => item.id) } },
      });
    }

    if (toAdd.length) {
      for (const employeeSetupId of toAdd) {
        await tx.applicantEmployeeSetup.create({
          data: { applicantId, employeeSetupId },
        });

        const questions = await tx.employeeSetupQuestion.findMany({
          where: { employeeSetupId },
          select: { id: true },
        });

        if (questions.length) {
          await tx.employeeSetupAnswer.createMany({
            data: questions.map((question) => ({
              employeeSetupQuestionId: question.id,
              employeeId: applicantId,
              is_done: false,
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    return tx.applicantEmployeeSetup.findMany({
      where: { applicantId },
      include: buildAssignmentInclude(applicantId),
    });
  });
};
