import db from "@/lib/prisma";
import { RecruitmentStage } from "@prisma/client";
import dayjs from "dayjs";
import { GeneralError } from "../utils/general-error";
import { ApplicantPayloadCreateModel } from "../models/applicant";

export const GET_APPLICANTS = async () => {
  const candidates = await db.applicant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
      user: true,
      mbti_test: true,
      scheduleInterview: true,
      evaluatorAssignment: {
        include: {
          evaluator: true,
          baseMatriks: {
            include: {
              columns: true,
              rows: {
                include: {
                  matriksQuestionOption: {
                    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
                  },
                },
                orderBy: [{ order: "asc" }, { createdAt: "asc" }],
              },
            },
          },
        },
      },
    },
  });

  return candidates;
};

export const GET_APPLICANT_BY_USER_ID = async (user_id: string) => {
  const candidates = await db.applicant.findMany({
    where: { user_id },
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
      user: true,
      mbti_test: true,
      scheduleInterview: true,
    },
  });

  return candidates;
};

export const CREATE_APPLICANT = async (
  payload: ApplicantPayloadCreateModel
) => {
  const { user_id, job_id } = payload || {};
  if (!user_id || !job_id) {
    throw new GeneralError({
      code: 400,
      details: "user_id dan job_id wajib diisi",
      error: "Bad Request",
      error_code: "BAD_REQUEST",
    });
  }

  // Opsional: cegah double-apply
  const existing = await db.applicant.findFirst({
    where: { user_id, job_id },
    select: { id: true },
  });
  if (existing) {
    throw new GeneralError({
      code: 409,
      details: "Kamu sudah melamar untuk posisi ini.",
      error: "Conflict",
      error_code: "ALREADY_APPLIED",
    });
  }

  // Cara 1: isi FK langsung
  const result = await db.applicant.create({
    data: { user_id, job_id },
  });

  // // Cara 2 (alternatif): pakai connect
  // const result = await prisma.applicant.create({
  //   data: {
  //     user: { connect: { id: user_id } },
  //     job:  { connect: { id: job_id } },
  //   },
  // });

  return result;
};

export const GET_APPLICANT = async (id: string) => {
  const detailCandidate = await db.applicant.findUnique({
    where: { id },
    include: {
      job: true,
      user: true,
      mbti_test: true,
      scheduleInterview: true,
    },
  });

  return detailCandidate;
};

export const UPDATE_STATUS_CANDIDATE = async (
  id: string,
  stage: RecruitmentStage
) => {
  const dateUpdated = dayjs();
  const updatedCandidate = await db.applicant.update({
    where: { id },
    data: { stage, updatedAt: dateUpdated.toDate() },
  });

  return updatedCandidate;
};

export const GET_APPLICANTS_BY_JOB_ID = async (job_id: string) => {
  const result = await db.applicant.findMany({
    where: { job_id },
    include: {
      job: true,
      user: true,
      mbti_test: true,
      scheduleInterview: true,
      evaluatorAssignment: {
        include: {
          evaluator: true,
          baseMatriks: {
            include: {
              columns: true,
              rows: {
                include: {
                  matriksQuestionOption: {
                    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
                  },
                },
                orderBy: [{ order: "asc" }, { createdAt: "asc" }],
              },
            },
          },
        },
      },
    },
  });
  return result;
};
