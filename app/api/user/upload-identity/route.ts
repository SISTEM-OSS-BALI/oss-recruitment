// app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ocrFromFile } from "@/lib/tesseract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ok = { success: true; message: string; result: { text: string } };
type Err = { success: false; message: string; error?: string };

const ok = (result: Ok["result"], status = 200) =>
  NextResponse.json<Ok>({ success: true, message: "OK", result }, { status });
const bad = (message: string, status = 400) =>
  NextResponse.json<Err>({ success: false, message }, { status });
const fail = (message: string, error?: unknown, status = 500) =>
  NextResponse.json<Err>(
    {
      success: false,
      message,
      error: error instanceof Error ? error.message : String(error),
    },
    { status }
  );

async function downloadToTmp(url: string): Promise<string> {
  const r = await fetch(url, { headers: { "User-Agent": "OCR/1.0" } });
  if (!r.ok) throw new Error(`download failed: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get("content-type") || "";
  const ext = ct.includes("png")
    ? ".png"
    : ct.includes("webp")
    ? ".webp"
    : ".jpg";
  const tmp = path.join(
    "/tmp",
    `ocr-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
  );
  await fs.writeFile(tmp, buf);
  return tmp;
}

export const POST = async (req: NextRequest) => {
  try {
    const ct = req.headers.get("content-type") || "";
    let imageUrl: string | undefined;

    if (ct.includes("application/json")) {
      const body = await req.json().catch(() => null);
      imageUrl =
        typeof body?.image_url === "string" ? body.image_url.trim() : undefined;
    } else if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const val = form.get("image_url");
      imageUrl = typeof val === "string" ? val.trim() : undefined;
    } else {
      const txt = (await req.text()).trim();
      if (txt.startsWith("http")) imageUrl = txt;
    }

    if (!imageUrl) return bad("`image_url` is required");

    try {
      const u = new URL(imageUrl);
      if (!/^https?:$/.test(u.protocol))
        return bad("`image_url` must be http(s)");
    } catch {
      return bad("`image_url` is not a valid URL");
    }

    const localPath = await downloadToTmp(imageUrl);
    try {
      const text = await ocrFromFile(localPath, "eng"); // or "eng+ind"
      return ok({ text });
    } finally {
      fs.unlink(localPath).catch(() => {});
    }
  } catch (err) {
    return fail("OCR failed", err, 500);
  }
};
