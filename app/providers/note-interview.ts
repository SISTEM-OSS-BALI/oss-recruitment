import db from "@/lib/prisma";
import {
  NoteInterviewPayloadCreateModel,
  NoteInterviewPayloadUpdateModel,
} from "../models/note-interview";

export const GET_NOTE_INTERVIEW_BY_APPLICANT_ID = async (
  applicant_id: string
) => {
  const result = await db.noteInterview.findMany({
    where: {
      applicant_id: applicant_id,
    },
  });
  return result;
};

export const CREATE_NOTE_INTERVIEW = async (
  payload: NoteInterviewPayloadCreateModel
) => {
  const result = await db.noteInterview.create({
    data: payload,
  });

  return result;
};

export const UPDATE_NOTE_INTERVIEW = async (
  id: string,
  payload: NoteInterviewPayloadUpdateModel
) => {
  const result = await db.noteInterview.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_NOTE_INTERVIEW = async (id: string) => {
  const result = await db.noteInterview.delete({
    where: {
      id,
    },
  });
  return result;
};
