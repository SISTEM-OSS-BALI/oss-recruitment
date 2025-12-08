"use server";

import sharp from "sharp";

type TemplateInput = string | Buffer | Uint8Array;

/**
 * Layout box pakai rasio (0–1) terhadap width/height image template
 */

// Posisi teks kiri bawah (kira-kira, bisa di-tweak)
const NAME_BOX = { x: 0.08, y: 0.78, width: 0.6, height: 0.09 };
const POSITION_BOX = { x: 0.08, y: 0.7, width: 0.6, height: 0.08 };
const NUMBER_BOX = { x: 0.08, y: 0.9, width: 0.84, height: 0.06 };

// Area foto di kanan (persegi panjang)
const AVATAR_BOX = { x: 0.5, y: 0.18, width: 0.48, height: 0.78 };
const AVATAR_OPACITY = 0.7; // 0 = transparan, 1 = solid

// Warna teks (bisa sesuaikan brand)
const NAME_COLOR = "#FFE17A"; // contoh: NGURAH (kuning)
const POSITION_COLOR = "#000000"; // contoh: IT / Software Engineer (hitam)
const NUMBER_COLOR = "#FFFFFF"; // contoh: kode EMP (putih)

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function estimateTextWidth(chars: number, fontSize: number) {
  // Perkiraan lebar text (simple), bisa di-tweak
  return Math.max(1, chars) * fontSize * 0.6;
}

function fitFontSize(
  text: string,
  maxW: number,
  maxH: number,
  startRatio = 0.75,
  min = 10
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

const buildBox = (
  box: { x: number; y: number; width: number; height: number },
  width: number,
  height: number
) => ({
  x: Math.round(box.x * width),
  y: Math.round(box.y * height),
  width: Math.round(box.width * width),
  height: Math.round(box.height * height),
});

const initialsFromName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "OSS";

const createPlaceholderAvatar = (name: string, size: number) => {
  const initials = escapeXml(initialsFromName(name));
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c82ff"/>
      <stop offset="100%" stop-color="#913fff"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${
    size * 0.12
  }" fill="url(#grad)" />
  <text
    x="50%"
    y="50%"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Poppins, Inter, Arial, Helvetica, sans-serif"
    font-size="${size * 0.4}"
    font-weight="700"
  >${initials}</text>
</svg>
  `.trim();
};

export type GenerateTeamMemberCardPayload = {
  name: string;
  position: string;
  employeeNumber: string;
};

export type GenerateTeamMemberCardOptions = {
  template: TemplateInput;
  avatar?: TemplateInput; // foto asli (opsional)
  format?: "png" | "jpeg";
  uppercaseName?: boolean;
};

export async function generateTeamMemberCard(
  payload: GenerateTeamMemberCardPayload,
  options: GenerateTeamMemberCardOptions
) {
  const { template, avatar, format = "png", uppercaseName = true } = options;
  if (!template) {
    throw new Error("Template image is required.");
  }

  // Baca template dasar
  const base = sharp(template);
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Failed to read template dimensions.");
  }

  const W = meta.width;
  const H = meta.height;

  // Normalisasi teks
  const name = escapeXml(
    (uppercaseName ? payload.name.toUpperCase() : payload.name).trim() || "-"
  );
  const position = escapeXml(payload.position.trim() || "-");
  const number = escapeXml(payload.employeeNumber.trim() || "-");

  // Hitung box final dalam pixel
  const nameBox = buildBox(NAME_BOX, W, H);
  const positionBox = buildBox(POSITION_BOX, W, H);
  const numberBox = buildBox(NUMBER_BOX, W, H);
  const avatarBox = buildBox(AVATAR_BOX, W, H);

  // Hitung font size agar muat
  const nameFontSize = fitFontSize(name, nameBox.width, nameBox.height, 0.72);
  const positionFontSize = fitFontSize(
    position,
    positionBox.width,
    positionBox.height,
    0.7,
    9
  );
  const numberFontSize = fitFontSize(
    number,
    numberBox.width,
    numberBox.height,
    0.65,
    9
  );

  // SVG overlay untuk text
  const svgOverlay = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="${nameBox.x}"
    y="${nameBox.y + nameBox.height / 2}"
    text-anchor="start"
    dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${nameFontSize}"
    fill="${NAME_COLOR}"
  >${name}</text>

  <text
    x="${positionBox.x}"
    y="${positionBox.y + positionBox.height / 2}"
    text-anchor="start"
    dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, sans-serif"
    font-weight="600"
    font-size="${positionFontSize}"
    fill="${POSITION_COLOR}"
    letter-spacing="1"
  >${position}</text>

  <text
    x="${numberBox.x}"
    y="${numberBox.y + numberBox.height / 2}"
    text-anchor="start"
    dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, sans-serif"
    font-weight="600"
    font-size="${numberFontSize}"
    fill="${NUMBER_COLOR}"
    letter-spacing="1.5"
  >${number}</text>
</svg>`.trim();

  // Siapkan avatar (foto kanan) + opacity
  let avatarBuffer: Buffer;
  if (avatar) {
    // Pakai foto asli, di-resize supaya nutup area avatarBox
    avatarBuffer = await sharp(avatar)
      .resize(avatarBox.width, avatarBox.height, { fit: "cover" })
      .toBuffer();
  } else {
    // Placeholder pakai inisial
    const size = Math.max(avatarBox.width, avatarBox.height);
    const placeholderSvg = createPlaceholderAvatar(payload.name, size);
    avatarBuffer = await sharp(Buffer.from(placeholderSvg))
      .resize(avatarBox.width, avatarBox.height, { fit: "cover" })
      .png()
      .toBuffer();
  }

  const avatarOpacity = Math.min(Math.max(AVATAR_OPACITY, 0), 1);
  if (avatarOpacity < 1) {
    // Kurangi opacity keseluruhan foto supaya teks lebih jelas dibaca
    avatarBuffer = await sharp(avatarBuffer)
      .ensureAlpha()
      .linear([1, 1, 1, avatarOpacity], [0, 0, 0, 0])
      .toBuffer();
  }

  const overlays: sharp.OverlayOptions[] = [
    {
      input: avatarBuffer,
      left: avatarBox.x,
      top: avatarBox.y,
    },
    {
      input: Buffer.from(svgOverlay),
      left: 0,
      top: 0,
    },
  ];

  const composed = base.clone().composite(overlays);

  if (format === "jpeg") {
    return composed.jpeg().toBuffer();
  }
  return composed.png().toBuffer();
}
