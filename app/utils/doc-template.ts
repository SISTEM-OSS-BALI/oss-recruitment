// utils/docxRenderer.ts
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type DocxData = Record<string, any>;

/**
 * Download .docx binary dari URL (Supabase public URL), lalu render dengan data.
 */
export async function renderDocxFromUrl(
  fileUrl: string,
  data: DocxData
): Promise<Blob> {
  const ab = await fetchAsArrayBuffer(fileUrl);
  return renderDocxFromArrayBuffer(ab, data);
}

/**
 * Render .docx dari ArrayBuffer + data.
 */
export function renderDocxFromArrayBuffer(
  templateAb: ArrayBuffer,
  data: DocxData
): Blob {
  const zip = new PizZip(templateAb);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData(data);

  try {
    doc.render(); // akan throw kalau ada tag yang tidak cocok
  } catch (e: any) {
    // e.properties?.errors berisi detail placeholder yang gagal
    throw new Error("Render DOCX gagal: " + (e?.message || "Unknown error"));
  }

  const out = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return out;
}

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal ambil template: ${res.status}`);
  return await res.arrayBuffer();
}

/**
 * Helper untuk download file hasil render.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
