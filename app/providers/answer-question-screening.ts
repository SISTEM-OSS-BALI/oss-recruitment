import db from "@/lib/prisma";
import { GeneralError } from "@/app/utils/general-error";
import { AnswerQuestionScreeningPayloadCreateModel } from "../models/answer-question-screening";
import { RecruitmentStage } from "@prisma/client";

export const CREATE_ANSWER_SCREENING_QUESTION = async (
  payload: AnswerQuestionScreeningPayloadCreateModel
) => {
  const { job_id, user_id, base_id, answers } = payload;

  if (!job_id || !user_id || !base_id) {
    throw new GeneralError({
      code: 400,
      error: "Bad Request",
      error_code: "INVALID_PAYLOAD",
      details: "job_id, user_id, dan base_id wajib diisi.",
    });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new GeneralError({
      code: 400,
      error: "Bad Request",
      error_code: "EMPTY_ANSWERS",
      details: "Jawaban screening tidak boleh kosong.",
    });
  }

  const submissionTime = new Date();

  const result = await db.$transaction(async (tx) => {
    const base = await tx.questionBaseScreening.findUnique({
      where: { id: base_id },
      select: { id: true },
    });

    if (!base) {
      throw new GeneralError({
        code: 404,
        error: "Not Found",
        error_code: "BASE_NOT_FOUND",
        details: "Question base screening tidak ditemukan.",
      });
    }

    const baseQuestions = await tx.questionScreening.findMany({
      where: { baseId: base_id },
      select: { id: true },
    });

    if (!baseQuestions.length) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "BASE_WITHOUT_QUESTIONS",
        details: "Question base belum memiliki pertanyaan.",
      });
    }

    const allowedQuestionIds = new Set(
      baseQuestions.map((question) => question.id)
    );

    const filteredAnswers = answers
      .filter((answer) => allowedQuestionIds.has(answer.questionId))
      .map((answer) => ({
        questionId: answer.questionId,
        answerText: answer.answerText?.trim() ?? null,
        optionIds: Array.from(
          new Set(answer.optionIds?.map(String).filter(Boolean) ?? [])
        ),
      }));

    if (!filteredAnswers.length) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "INVALID_ANSWERS",
        details: "Tidak ada jawaban yang sesuai dengan base pertanyaan.",
      });
    }

    const existingApplicant = await tx.applicant.findFirst({
      where: { user_id, job_id },
      select: { id: true, screeningBaseId: true },
    });

    const applicant = existingApplicant
      ? await tx.applicant.update({
          where: { id: existingApplicant.id },
          data: {
            screeningBaseId: existingApplicant.screeningBaseId ?? base_id,
            screeningSubmittedAt: submissionTime,
            stage: RecruitmentStage.SCREENING,
          },
          select: { id: true },
        })
      : await tx.applicant.create({
          data: {
            user_id,
            job_id,
            screeningBaseId: base_id,
            screeningSubmittedAt: submissionTime,
            stage: RecruitmentStage.SCREENING,
          },
          select: { id: true },
        });

    await tx.answerQuestionScreening.deleteMany({
      where: {
        applicantId: applicant.id,
        questionId: { in: Array.from(allowedQuestionIds) },
      },
    });

    let createdCount = 0;

    for (const answer of filteredAnswers) {
      const optionIds = answer.optionIds ?? [];
      const data: {
        applicantId: string;
        questionId: string;
        answerText: string | null;
        selectedOptions?:
          | {
              create: { optionId: string }[];
            }
          | undefined;
      } = {
        applicantId: applicant.id,
        questionId: answer.questionId,
        answerText: optionIds.length ? null : answer.answerText,
      };

      if (optionIds.length) {
        data.selectedOptions = {
          create: optionIds.map((optionId) => ({ optionId })),
        };
      }

      await tx.answerQuestionScreening.create({ data });
      createdCount += 1;
    }

    return {
      applicantId: applicant.id,
      totalAnswers: createdCount,
      submittedAt: submissionTime,
    };
  });

  return result;
};

export const GET_ANSWER_SCREENING_QUESTIONS = async () => {
  const result = await db.answerQuestionScreening.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      question: {
        include: {
          options: true,
        },
      },
      selectedOptions: true,
    },
  });

  return result;
};

export const GET_ANSWER_SCREENING_QUESTIONS_BY_APPLICANT_ID = async (
  applicant_id: string
) => {
  const result = await db.answerQuestionScreening.findMany({
    where: { applicantId: applicant_id },
    orderBy: { createdAt: "desc" },
    include: {
      question: {
        include: {
          base: true,
          options: {
            include: {
              selectedBy: true,
            },
          },
        },
      },
      selectedOptions: true,
    },
  });

  return result;
};
