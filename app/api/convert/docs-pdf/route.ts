// /app/api/convert/docx-to-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";

function getCandidates() {
  const list = [];
  if (process.env.SOFFICE_PATH) list.push(process.env.SOFFICE_PATH);
  list.push("soffice", "libreoffice");
  list.push("/Applications/LibreOffice.app/Contents/MacOS/soffice"); // macOS
  list.push(
    "/usr/bin/soffice",
    "/usr/local/bin/soffice",
    "/usr/bin/libreoffice"
  ); // Linux
  list.push(
    "C:\\\\Program Files\\\\LibreOffice\\\\program\\\\soffice.exe",
    "C:\\\\Program Files (x86)\\\\LibreOffice\\\\program\\\\soffice.exe"
  );
  return list;
}

async function resolveSoffice(): Promise<string | null> {
  for (const p of getCandidates()) {
    const isAbsolute = p.includes("/") || p.includes("\\");
    if (isAbsolute) {
      try {
        await fs.access(p);
        return p;
      } catch {}
    } else {
      try {
        await new Promise<void>((res, rej) => {
          const proc = spawn(p, ["--version"]);
          proc.on("error", rej);
          proc.on("close", () => res());
        });
        return p;
      } catch {}
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const soffice = await resolveSoffice();
    if (!soffice) {
      return NextResponse.json(
        {
          error:
            "LibreOffice (soffice) not found. Set SOFFICE_PATH atau pastikan ada di PATH.",
        },
        { status: 501 }
      );
    }

    const tmp = path.join("/tmp", randomUUID());
    await fs.mkdir(tmp, { recursive: true });

    const input = path.join(tmp, "input.docx");
    const output = path.join(tmp, "input.pdf");
    await fs.writeFile(input, Buffer.from(await file.arrayBuffer()));

    await new Promise<void>((resolve, reject) => {
      const args = [
        "--headless",
        "--convert-to",
        "pdf",
        input,
        "--outdir",
        tmp,
      ];
      const proc = spawn(soffice, args, {
        stdio: ["ignore", "ignore", "pipe"],
      });
      let stderr = "";
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(stderr || `Exit ${code}`))
      );
    });

    const pdf = await fs.readFile(output);
    fs.rm(tmp, { recursive: true, force: true }).catch(() => {});

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="converted.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Conversion failed" },
      { status: 500 }
    );
  }
}
