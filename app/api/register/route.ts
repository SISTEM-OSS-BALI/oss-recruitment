import { UserPayloadCreateModel } from "@/app/models/user";
import { CREATE_USER } from "@/app/providers/user";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: UserPayloadCreateModel = await req.json();

    const data = await CREATE_USER(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully registered!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
