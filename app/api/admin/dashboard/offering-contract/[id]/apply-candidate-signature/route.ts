import { PDFDocument } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";

import { GET_OFFERING_CONTRACT } from "@/app/providers/offering-contract";
import { GeneralError } from "@/app/utils/general-error";
import { fetchArrayBuffer, saveSignedPdfResult } from "@/app/utils/contract-signature";
import { supabase } from "@/app/utils/supabase-client";

const BUCKET = "web-oss-recruitment";
const SIGNATURE_WIDTH = 180;
const SIGNATURE_HEIGHT = 80;
const SIGNATURE_X = 330; // sesuaikan
const SIGNATURE_Y = 120;
const SIGNATURE_PAGE_OFFSET = 0; // 0 = halaman terakhir

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await GET_OFFERING_CONTRACT(params.id);
    if (!contract) {
      throw new GeneralError({
        code: 404,
        error: "Not Found",
        error_code: "OFFER_CONTRACT_NOT_FOUND",
        details: "Kontrak tidak ditemukan.",
      });
    }
    if (!contract.filePath || !contract.candidateSignatureUrl) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "MISSING_SIGNATURE_OR_FILE",
        details: "PDF kontrak atau signature belum tersedia.",
      });
    }

    const [pdfBytes, signatureBytes] = await Promise.all([
      fetchArrayBuffer(contract.filePath),
      fetchArrayBuffer(contract.candidateSignatureUrl),
    ]);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const png = await pdfDoc.embedPng(signatureBytes);
    const pages = pdfDoc.getPages();
    const targetPage =
      pages[Math.max(pages.length - 1 - SIGNATURE_PAGE_OFFSET, 0)];
    targetPage.drawImage(png, {
      x: SIGNATURE_X,
      y: SIGNATURE_Y,
      width: SIGNATURE_WIDTH,
      height: SIGNATURE_HEIGHT,
    });

    const stampedPdf = await pdfDoc.save();
    const filePath = `candidate-signed/${contract.id}-${Date.now()}.pdf`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, stampedPdf, {
        contentType: "application/pdf",
      });
    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error("Gagal mendapatkan URL publik.");
    }

    await saveSignedPdfResult({
      contractId: contract.id,
      signedUrl: data.publicUrl,
      signedPath: filePath,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signature berhasil ditempelkan.",
        result: data.publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.error,
          error_code: error.error_code,
          details: error.details,
        },
        { status: error.code }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses signature PDF.",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
