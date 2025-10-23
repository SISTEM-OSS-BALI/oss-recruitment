import { NoteInterviewPayloadCreateModel } from "@/app/models/note-interview";
import { CREATE_NOTE_INTERVIEW, GET_NOTE_INTERVIEW_BY_APPLICANT_ID } from "@/app/providers/note-interview";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("applicant_id") as string;

  try {
    const data = await GET_NOTE_INTERVIEW_BY_APPLICANT_ID(id);
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
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const payload: NoteInterviewPayloadCreateModel = await req.json();

    const data = await CREATE_NOTE_INTERVIEW(payload);

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
  }
};
