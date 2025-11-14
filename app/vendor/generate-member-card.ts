import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Pita putih untuk NAMA (rasio terhadap kanvas 1004×638) */
const NAME_BOX = {
  left: 54 / 1004,
  top: 311 / 638,
  right: 754 / 1004,
  bottom: 368 / 638,
  padX: 30 / 1004,
  padY: 8 / 638,
};

/** Area KODE UNIK: tepat di bawah "Member Card Sahabat Referral OSS" (pojok kanan atas) */
const CODE_BOX = {
  left: 620 / 1004, // mulai agak ke kanan
  right: 970 / 1004, // jangan terlalu mepet sisi kanan/rounded corner
  top: 80 / 638, // di bawah judul
  bottom: 120 / 638, // tinggi box ~40px
};

const NAME_COLOR = "#1C3A4A"; // warna teks nama (gelap, cocok di pita putih)
const CODE_COLOR = "#FFFFFF"; // warna kode (kontras di area gelap)

/** Sumber template bisa string path atau buffer */
type TemplateInput = string | Buffer | Uint8Array;

/* -------------------- Helpers -------------------- */

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Estimasi kasar lebar teks (uppercase ≈ 0.62em) untuk fitting cepat */
function estimateTextWidth(chars: number, fontSize: number) {
  return Math.max(1, chars) * fontSize * 0.62;
}

/** Cari font-size yang muat di (maxW × maxH) */
function fitFontSize(
  text: string,
  maxW: number,
  maxH: number,
  startRatio = 0.7,
  min = 8
) {
  let fontSize = Math.floor(maxH * startRatio);
  while (
    fontSize > min &&
    estimateTextWidth(text.length, fontSize) > maxW * 0.96
  ) {
    fontSize -= 1;
  }
  return Math.max(fontSize, min);
}

/* -------------------- Types -------------------- */

export type GenerateMemberCardOptions = {
  /** Template sisi depan (yang ada pita putih untuk nama) */
  frontTemplatePath?: string;
  frontTemplate?: TemplateInput;
  /** Template sisi belakang (opsional, di-pass-through) */
  backTemplatePath?: string;
  backTemplate?: TemplateInput;

  /** Jika diisi, simpan ke folder ini selain mengembalikan buffer */
  outDir?: string;
  /** Dasar nama file keluaran (tanpa ekstensi) ketika outDir dipakai */
  outFileBaseName?: string;

  /** png|jpeg (default: png) */
  format?: "png" | "jpeg";

  /** Paksa uppercase untuk NAMA (default: true) */
  uppercase?: boolean;
};

/* -------------------- Main -------------------- */

export async function generateMemberCard(
  name: string,
  no_unique: string,
  opts: GenerateMemberCardOptions
): Promise<{
  front: Buffer;
  back?: Buffer;
  frontPath?: string;
  backPath?: string;
}> {
  const {
    frontTemplatePath,
    frontTemplate,
    backTemplatePath,
    backTemplate,
    outDir,
    outFileBaseName = "member-card",
    format = "png",
    uppercase = true,
  } = opts;

  const frontSource = frontTemplate ?? frontTemplatePath;
  if (!frontSource) {
    throw new Error("Front template is required (path or buffer).");
  }
  const backSource = backTemplate ?? backTemplatePath;

  // Baca metadata template depan
  const base = sharp(frontSource);
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Tidak bisa membaca ukuran template depan.");
  }
  const W = meta.width;
  const H = meta.height;

  /* ---------- Hitung area NAMA di pita putih ---------- */
  const nx0 = Math.round(NAME_BOX.left * W);
  const ny0 = Math.round(NAME_BOX.top * H);
  const nx1 = Math.round(NAME_BOX.right * W);
  const ny1 = Math.round(NAME_BOX.bottom * H);
  const nPadX = Math.round(NAME_BOX.padX * W);
  const nPadY = Math.round(NAME_BOX.padY * H);

  const nInnerX = nx0 + nPadX;
  const nInnerY = ny0 + nPadY;
  const nInnerW = nx1 - nx0 - nPadX * 2;
  const nInnerH = ny1 - ny0 - nPadY * 2;

  const nameText = escapeXml(
    (uppercase ? name.toUpperCase() : name).trim() || "-"
  );
  const nameSize = fitFontSize(nameText, nInnerW, nInnerH, 0.78);
  const nameCx = nInnerX + nInnerW / 2;
  const nameCy = nInnerY + nInnerH / 2;

  /* ---------- Hitung area KODE UNIK di bawah judul atas ---------- */
  const cx0 = Math.round(CODE_BOX.left * W);
  const cy0 = Math.round(CODE_BOX.top * H);
  const cx1 = Math.round(CODE_BOX.right * W);
  const cy1 = Math.round(CODE_BOX.bottom * H);

  const cInnerX = cx0;
  const cInnerY = cy0;
  const cInnerW = cx1 - cx0;
  const cInnerH = cy1 - cy0;

  const codeText = escapeXml((no_unique ?? "").toString().trim());
  const codeSize = fitFontSize(codeText, cInnerW, cInnerH, 0.9); // box rendah → gunakan 90% tinggi
  const codeCx = cInnerX + cInnerW / 2;
  const codeCy = cInnerY + cInnerH / 2;

  /* ---------- SVG overlay (NAMA + KODE) ---------- */
  const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- NAMA di pita putih -->
  <text
    x="${nameCx}" y="${nameCy}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, 'DejaVu Sans', sans-serif"
    font-weight="700" font-size="${nameSize}" fill="${NAME_COLOR}"
  >${nameText}</text>

  <!-- KODE unik di bawah "Member Card Sahabat Referral OSS" -->
  <text
    x="${codeCx}" y="${codeCy}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, 'DejaVu Sans', sans-serif"
    font-weight="600" font-size="${codeSize}" fill="${CODE_COLOR}"
    letter-spacing="0.5"
  >${codeText}</text>
</svg>`.trim();

  // Render depan
  const composed = base.composite([
    { input: Buffer.from(svg), top: 0, left: 0 },
  ]);
  const front =
    format === "png"
      ? await composed.png().toBuffer()
      : await composed.jpeg().toBuffer();

  // Render belakang (passthrough bila ada)
  let backBuffer: Buffer | undefined;
  if (backSource) {
    const backSharp = sharp(backSource);
    backBuffer =
      format === "png"
        ? await backSharp.png().toBuffer()
        : await backSharp.jpeg().toBuffer();
  }

  // Tulis file jika diminta
  let frontPath: string | undefined;
  let backPath: string | undefined;
  if (outDir) {
    await fs.mkdir(outDir, { recursive: true });
    const safeBase = (outFileBaseName || "member-card").replace(
      /[^\w.-]+/g,
      "_"
    );

    frontPath = path.join(outDir, `${safeBase}-front.${format}`);
    await fs.writeFile(frontPath, front);

    if (backBuffer) {
      backPath = path.join(outDir, `${safeBase}-back.${format}`);
      await fs.writeFile(backPath, backBuffer);
    }
  }

  return { front, back: backBuffer, frontPath, backPath };
}
