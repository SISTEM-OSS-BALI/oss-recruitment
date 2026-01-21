// lib/poster/generateJobPoster.ts
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";

type PosterInput = {
  company?: string;
  headline?: string; // "Lowongan Pekerjaan!"
  role?: string; // "Desain Grafis"
  badgeLeft?: string; // "Pekerjaan untuk"
  badgeRight?: string; // "Pascik and Lige"
  sectionTitle?: string; // "Persyaratan"
  requirements?: string[];
  ctaTitle?: string; // "Kirimkan CV dan Portofolio"
  contact?: string; // "recruitment@..."
  theme?: {
    primary?: string; // #1E5EFF
    secondary?: string; // #F2C94C
    dark?: string; // #0F172A
    muted?: string; // #64748B
    bg?: string; // #FFFFFF
    card?: string; // #F8FAFC
  };
  // opsional: logo / ilustrasi dari URL (harus publik)
  logoUrl?: string;
  illustrationUrl?: string;
};

function clampText(ctx: any, text: string, maxWidth: number) {
  // kalau kepanjangan, potong dan tambahin "…"
  let t = text;
  while (ctx.measureText(t).width > maxWidth && t.length > 1) {
    t = t.slice(0, -2);
  }
  return t.length < text.length ? t + "…" : t;
}

function wrapLines(ctx: any, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: any,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export async function generateJobPosterPNG(input: PosterInput) {
  const W = 1080;
  const H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = {
    primary: input.theme?.primary ?? "#2563EB",
    secondary: input.theme?.secondary ?? "#F4C95D",
    dark: input.theme?.dark ?? "#0F172A",
    muted: input.theme?.muted ?? "#64748B",
    bg: input.theme?.bg ?? "#FFFFFF",
    card: input.theme?.card ?? "#F8FAFC",
  };

  const headline = input.headline ?? "Lowongan Pekerjaan!";
  const role = input.role ?? "Desain Grafis";
  const badgeLeft = input.badgeLeft ?? "Pekerjaan untuk";
  const badgeRight = input.badgeRight ?? input.company ?? "Perusahaan Kamu";
  const sectionTitle = input.sectionTitle ?? "Persyaratan";
  const reqs = input.requirements?.length
    ? input.requirements.slice(0, 6)
    : [
        "Pendidikan minimal SMA/sederajat",
        "Menguasai tools desain (AI/PS/Figma)",
        "Kreatif, rapi, dan komunikatif",
        "Mampu bekerja dengan deadline",
      ];

  const ctaTitle = input.ctaTitle ?? "Kirimkan CV dan Portofolio";
  const contact = input.contact ?? "recruitment@perusahaan.com";

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative blob (kanan bawah)
  ctx.fillStyle = theme.secondary;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.ellipse(860, 780, 360, 300, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Header badge
  const badgeX = 72;
  const badgeY = 64;
  const badgeH = 44;
  const badgePaddingX = 18;

  ctx.font = "600 20px Arial";
  const leftW = ctx.measureText(badgeLeft).width;
  const rightW = ctx.measureText(badgeRight).width;

  const badgeW = leftW + rightW + badgePaddingX * 3 + 14;

  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 22);
  ctx.fillStyle = "#EEF2FF";
  ctx.fill();

  // dot icon
  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.arc(badgeX + 22, badgeY + 22, 6, 0, Math.PI * 2);
  ctx.fill();

  // badge text
  ctx.fillStyle = theme.muted;
  ctx.fillText(badgeLeft, badgeX + 36, badgeY + 29);

  ctx.fillStyle = theme.dark;
  ctx.font = "700 20px Arial";
  ctx.fillText(badgeRight, badgeX + 36 + leftW + 18, badgeY + 29);

  // Optional Logo (kiri atas) kecil
  if (input.logoUrl) {
    try {
      const img = await loadImage(input.logoUrl);
      const size = 46;
      ctx.save();
      roundRect(ctx, 72, 124, size, size, 12);
      ctx.clip();
      ctx.drawImage(img, 72, 124, size, size);
      ctx.restore();
    } catch {}
  }

  // Headline besar
  ctx.fillStyle = theme.primary;
  ctx.font = "800 88px Arial";
  const headLines = wrapLines(ctx, headline, 720);
  let y = 210;
  for (const line of headLines.slice(0, 2)) {
    ctx.fillText(line, 72, y);
    y += 92;
  }

  // Role underline / link style
  ctx.fillStyle = theme.dark;
  ctx.font = "700 34px Arial";
  const roleText = clampText(ctx, role, 520);
  ctx.fillText(roleText, 72, y + 22);

  // underline
  const roleW = ctx.measureText(roleText).width;
  ctx.strokeStyle = theme.muted;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, y + 32);
  ctx.lineTo(72 + roleW, y + 32);
  ctx.stroke();

  // Card Persyaratan
  const cardX = 72;
  const cardY = y + 72;
  const cardW = 560;
  const cardH = 340;

  // shadow
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#000000";
  roundRect(ctx, cardX + 6, cardY + 10, cardW, cardH, 22);
  ctx.fill();
  ctx.restore();

  roundRect(ctx, cardX, cardY, cardW, cardH, 22);
  ctx.fillStyle = theme.card;
  ctx.fill();

  ctx.fillStyle = theme.primary;
  ctx.font = "800 28px Arial";
  ctx.fillText(sectionTitle, cardX + 28, cardY + 54);

  // bullets
  ctx.font = "500 22px Arial";
  ctx.fillStyle = theme.dark;

  let by = cardY + 96;
  const bulletX = cardX + 32;
  const textX = bulletX + 22;
  const maxTextW = cardW - 70;

  for (const r of reqs) {
    if (by > cardY + cardH - 72) break;

    // bullet
    ctx.fillStyle = theme.primary;
    ctx.beginPath();
    ctx.arc(bulletX, by - 7, 5, 0, Math.PI * 2);
    ctx.fill();

    // text (wrap max 2 lines)
    ctx.fillStyle = theme.dark;
    ctx.font = "500 22px Arial";
    const lines = wrapLines(ctx, r, maxTextW).slice(0, 2);
    for (const line of lines) {
      ctx.fillText(line, textX, by);
      by += 28;
    }
    by += 16;
  }

  // CTA card kecil
  const ctaX = 72;
  const ctaY = cardY + cardH + 28;
  const ctaW = 560;
  const ctaH = 84;

  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 18);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // CTA border
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 18);
  ctx.stroke();

  ctx.fillStyle = theme.dark;
  ctx.font = "700 22px Arial";
  ctx.fillText(clampText(ctx, ctaTitle, 460), ctaX + 22, ctaY + 34);

  ctx.fillStyle = theme.muted;
  ctx.font = "500 20px Arial";
  ctx.fillText(clampText(ctx, contact, 480), ctaX + 22, ctaY + 62);

  // Ilustrasi minimal (kanan) – biar mirip konsep contoh (orang + laptop bentuk sederhana)
  const illuBaseX = 710;
  const illuBaseY = 380;

  // Kalau user provide illustrationUrl, pakai itu
  if (input.illustrationUrl) {
    try {
      const illu = await loadImage(input.illustrationUrl);
      ctx.drawImage(illu, 650, 360, 380, 520);
    } catch {
      // fallback vector
    }
  }

  // Vector fallback (selalu kita gambar, tetap cakep walau tanpa png)
  // desk
  ctx.fillStyle = "#F1F5F9";
  roundRect(ctx, illuBaseX - 40, illuBaseY + 360, 360, 34, 14);
  ctx.fill();

  // laptop
  ctx.fillStyle = "#0B1220";
  roundRect(ctx, illuBaseX + 140, illuBaseY + 240, 150, 92, 10);
  ctx.fill();
  ctx.fillStyle = "#E2E8F0";
  roundRect(ctx, illuBaseX + 152, illuBaseY + 252, 126, 68, 8);
  ctx.fill();

  // person body
  ctx.fillStyle = "#EF4444";
  roundRect(ctx, illuBaseX + 20, illuBaseY + 250, 130, 140, 40);
  ctx.fill();

  // person head
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(illuBaseX + 86, illuBaseY + 220, 34, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = "#B91C1C";
  ctx.beginPath();
  ctx.ellipse(illuBaseX + 80, illuBaseY + 210, 34, 22, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // mug
  ctx.fillStyle = theme.primary;
  roundRect(ctx, illuBaseX + 110, illuBaseY + 322, 28, 28, 6);
  ctx.fill();

  return canvas.toBuffer("image/png");
}
