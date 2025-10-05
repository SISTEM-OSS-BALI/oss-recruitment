import { CREATE_MBTI_TEST, GET_MBTI_TESTS } from "@/app/providers/mbti-test";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

interface PayloadMbtiTest {
  user_id: string;
  applicant_id: string;
}

export const GET = async () => {
  try {
    const data = await GET_MBTI_TESTS();
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
    const payload: PayloadMbtiTest = await req.json();

    const data = await CREATE_MBTI_TEST(payload);

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
