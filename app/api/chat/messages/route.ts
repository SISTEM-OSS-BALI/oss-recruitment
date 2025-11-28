import { NextRequest, NextResponse } from "next/server";
import {
  getConversationForRecruitment,
  getConversationMessagesWithSender,
} from "@/app/providers/chat";

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const conversationId = searchParams.get("conversationId");
  const applicantId = searchParams.get("applicantId");

  if (!conversationId && !applicantId) {
    return NextResponse.json(
      {
        success: false,
        message: "conversationId atau applicantId harus diisi",
      },
      { status: 400 }
    );
  }

  try {
    const conversation = await getConversationForRecruitment(
      conversationId ? { conversationId } : { applicantId: applicantId! }
    );

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Percakapan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const messages = await getConversationMessagesWithSender(conversation.id);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil mengambil riwayat percakapan",
        result: {
          conversationId: conversation.id,
          messages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[chat/messages][GET]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat percakapan",
      },
      { status: 500 }
    );
  }
};
