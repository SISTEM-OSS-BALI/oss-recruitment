"use server";

import sharp from "sharp";
import { Ecc, QrCode } from "@rc-component/qrcode/lib/libs/qrcodegen";

type TemplateInput = string | Buffer | Uint8Array;

/**
 * Layout box pakai rasio (0–1) terhadap width/height image template
 */

// Layout untuk desain kartu baru (sesuaikan rasio dengan template portrait)
const NAME_BOX = { x: 0.1, y: 0.56, width: 0.8, height: 0.12 };
const POSITION_BOX = { x: 0.2, y: 0.69, width: 0.6, height: 0.06 };
const NUMBER_BOX = { x: 0.08, y: 0.92, width: 0.6, height: 0.04 };
const QR_BOX = { x: 0.08, y: 0.73, width: 0.17, height: 0.17 };

// Area foto (portrait di tengah atas)
const AVATAR_BOX = { x: 0.18, y: 0.12, width: 0.64, height: 0.5 };
const AVATAR_OPACITY = 1;

// Warna teks
const NAME_COLOR = "#F5F7FF";
const POSITION_COLOR = "#0b1b3b";
const NUMBER_COLOR = "#FFFFFF";
const QR_COLOR = "#0b1b3b";

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
  whatsappNumber?: string;
};

export type GenerateTeamMemberCardOptions = {
  template: TemplateInput;
  avatar?: TemplateInput; // foto asli (opsional)
  format?: "png" | "jpeg";
  uppercaseName?: boolean;
};

const buildQrSvg = (value: string, margin = 2) => {
  const qr = QrCode.encodeText(value, Ecc.MEDIUM);
  const size = qr.size;
  const viewSize = size + margin * 2;
  const ops: string[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (qr.getModule(x, y)) {
        const px = x + margin;
        const py = y + margin;
        ops.push(`M${px} ${py}h1v1H${px}z`);
      }
    }
  }

  return `
<svg width="${viewSize}" height="${viewSize}" viewBox="0 0 ${viewSize} ${viewSize}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#ffffff" />
  <path d="${ops.join("")}" fill="${QR_COLOR}" />
</svg>
  `.trim();
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
  const position = escapeXml(payload.position.trim().toUpperCase() || "-");
  const number = escapeXml(payload.employeeNumber.trim() || "-");

  // Hitung box final dalam pixel
  const nameBox = buildBox(NAME_BOX, W, H);
  const positionBox = buildBox(POSITION_BOX, W, H);
  const numberBox = buildBox(NUMBER_BOX, W, H);
  const avatarBox = buildBox(AVATAR_BOX, W, H);
  const qrBox = buildBox(QR_BOX, W, H);

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
    x="${nameBox.x + nameBox.width / 2}"
    y="${nameBox.y + nameBox.height / 2}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Poppins, Inter, Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${nameFontSize}"
    fill="${NAME_COLOR}"
  >${name}</text>

  <text
    x="${positionBox.x + positionBox.width / 2}"
    y="${positionBox.y + positionBox.height / 2}"
    text-anchor="middle"
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
  ];

  if (payload.whatsappNumber) {
    const qrValue = `https://wa.me/${payload.whatsappNumber}`;
    const qrSvg = buildQrSvg(qrValue);
    const qrBuffer = await sharp(Buffer.from(qrSvg))
      .resize(qrBox.width, qrBox.height, { fit: "contain" })
      .png()
      .toBuffer();
    overlays.push({
      input: qrBuffer,
      left: qrBox.x,
      top: qrBox.y,
    });
  }

  overlays.push({
    input: Buffer.from(svgOverlay),
    left: 0,
    top: 0,
  });

  const composed = base.clone().composite(overlays);

  if (format === "jpeg") {
    return composed.jpeg().toBuffer();
  }
  return composed.png().toBuffer();
}
