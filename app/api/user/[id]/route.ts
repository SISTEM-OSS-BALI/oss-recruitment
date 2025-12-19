import { UserPayloadUpdateModel } from "@/app/models/user";
import { DELETE_USER, GET_USER, UPDATE_MEMBER_CARD, UPDATE_NO_UNIQUE, UPDATE_USER, UPDATE_USER_DOCUMENT } from "@/app/providers/user";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await GET_USER(id);

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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const payload: UserPayloadUpdateModel = await req.json();

    const data = await UPDATE_USER(id, payload);

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
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Internal server error",
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

    const data = await DELETE_USER(id);

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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const raw = await req.json();

    // Definisi aksi
    type Action =
      | "UPDATE_NO_UNIQUE"
      | "UPDATE_MEMBER_CARD"
      | "UPDATE_USER_DOCUMENT";

    // Fallback penentuan aksi jika client tidak mengirim `action`
    const inferAction = (): Action => {
      if (typeof raw?.action === "string") {
        const a = raw.action as Action;
        if (
          [
            "UPDATE_NO_UNIQUE",
            "UPDATE_MEMBER_CARD",
            "UPDATE_USER_DOCUMENT",
          ].includes(a)
        ) {
          return a;
        }
        // action tak dikenal
        throw new GeneralError({
          code: 400,
          details: "action tak dikenal",
          error: "action tak dikenal",
          error_code: "INVALID_ACTION",
        });
      }
      if (raw?.no_unique !== undefined) return "UPDATE_NO_UNIQUE";
      if (
        typeof raw?.member_card_url === "string" ||
        typeof raw?.member_card_id === "string"
      ) {
        return "UPDATE_MEMBER_CARD";
      }
      return "UPDATE_USER_DOCUMENT";
    };

    const action = inferAction();
    let data: unknown;

    switch (action) {
      case "UPDATE_NO_UNIQUE": {
        const no_unique = raw?.no_unique;
        const emptyString = (v: unknown) =>
          typeof v === "string" && v.trim() === "";
        if (
          no_unique === undefined ||
          no_unique === null ||
          emptyString(no_unique)
        ) {
          return NextResponse.json(
            { success: false, message: "Field 'no_unique' wajib diisi." },
            { status: 400 }
          );
        }
        data = await UPDATE_NO_UNIQUE(id, { no_unique });
        break;
      }

      case "UPDATE_MEMBER_CARD": {
        // Minimal salah satu terisi
        const member_card_url =
          typeof raw?.member_card_url === "string" &&
          raw.member_card_url.trim() !== ""
            ? raw.member_card_url.trim()
            : undefined;

        if (!member_card_url) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Minimal salah satu dari 'member_card_url' atau 'member_card_id' wajib diisi.",
            },
            { status: 400 }
          );
        }

        // Ganti fungsi ini sesuai implementasi kamu
        data = await UPDATE_MEMBER_CARD(id, {
          member_card_url,
        });
        break;
      }

      case "UPDATE_USER_DOCUMENT":
      default: {
        data = await UPDATE_USER_DOCUMENT(id, raw as UserPayloadUpdateModel);
        break;
      }
    }

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
        message: "Failed to update document",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
