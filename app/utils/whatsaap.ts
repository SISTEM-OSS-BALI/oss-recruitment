// utils/whatsapp.ts
export function normalizeIDPhone(raw?: string) {
  const d = (raw ?? "").replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.startsWith("62")) return d; // sudah E.164 ID
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d; // kadang user tulis "812..."
  return d; // fallback (negara lain)
}

export function openWhatsAppTemplate(opts: {
  to: string;
  message?: string;
  name?: string;
  position?: string;
}) {
  const to = normalizeIDPhone(opts.to);

  const text =
    (opts.message ?? "").trim() ||
    [
      `*Halo, ${opts.name ?? "Kandidat"}!*`,
      `Status lamaran untuk posisi *${opts.position ?? "-"}*.`,
      "",
      "Silakan balas pesan ini jika ada pertanyaan.",
    ].join("\n");

  if (!to || !text) {
    return;
  }

  const encoded = encodeURIComponent(text);

  // Desktop cenderung pakai wa.me, mobile bisa pakai whatsapp://
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const webUrl = `https://wa.me/${to}?text=${encoded}`;
  const mobileUrl = `whatsapp://send?phone=${to}&text=${encoded}`;

  window.open(isMobile ? mobileUrl : webUrl, "_blank", "noopener,noreferrer");
}
