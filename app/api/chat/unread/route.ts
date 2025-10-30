import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getUnreadSummaryByUser } from "@/app/providers/chat";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const summary = await getUnreadSummaryByUser(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil mengambil jumlah chat belum dibaca",
        result: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[chat/unread][GET]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil jumlah chat belum dibaca",
      },
      { status: 500 }
    );
  }
};
