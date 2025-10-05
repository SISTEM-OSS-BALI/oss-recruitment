// app/api/webhooks/devil/mbti-completed/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { devilCheckTest } from "@/app/utils/mbti-helper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("test_id");
  if (!testId) {
    return NextResponse.json(
      { success: false, message: "Missing test_id" },
      { status: 400 }
    );
  }

  // Ambil hasil (sekali cek saja; jika butuh polling, set { poll:true })
  const result = await devilCheckTest(testId);

  // Update DB berdasarkan test_id yang sudah kamu simpan saat new_test
  const record = await db.mbtiTest.findFirst({ where: { test_id: testId } });
  if (!record) {
    return NextResponse.json(
      { success: false, message: "MbtiTest not found" },
      { status: 404 }
    );
  }

  await db.mbtiTest.update({
    where: { id: record.id },
    data: { result: JSON.stringify(result), is_complete: true },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
