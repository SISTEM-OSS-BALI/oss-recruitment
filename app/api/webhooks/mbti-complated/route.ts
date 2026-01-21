// app/api/webhooks/devil/mbti-completed/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { devilCheckTest } from "@/app/utils/mbti-helper";

export const runtime = "nodejs";

type WebhookPayload = {
  test_id?: string;
  testId?: string;
};

async function extractTestId(req: NextRequest): Promise<string | null> {
  const { searchParams } = new URL(req.url);
  const fromQuery = searchParams.get("test_id") ?? searchParams.get("testId");
  if (fromQuery) return fromQuery;

  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as
        | WebhookPayload
        | null;
      return body?.test_id ?? body?.testId ?? null;
    }

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await req.formData().catch(() => null);
      if (form) {
        const testId = form.get("test_id") ?? form.get("testId");
        return typeof testId === "string" ? testId : null;
      }
    }

    const text = await req.text().catch(() => "");
    if (text) {
      const params = new URLSearchParams(text);
      return params.get("test_id") ?? params.get("testId");
    }
  }

  return null;
}

async function handleWebhook(req: NextRequest) {
  const testId = await extractTestId(req);
  if (!testId) {
    return NextResponse.json(
      { success: false, message: "Missing test_id" },
      { status: 400 }
    );
  }

  // Ambil hasil (sekali cek saja; jika butuh polling, set { poll:true })
  let result;
  try {
    result = await devilCheckTest(testId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 502 }
    );
  }

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

export async function GET(req: NextRequest) {
  return handleWebhook(req);
}

export async function POST(req: NextRequest) {
  return handleWebhook(req);
}
