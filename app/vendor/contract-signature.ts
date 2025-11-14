import axios from "axios";
import { PDFDocument } from "pdf-lib";
import type { OfferingContract } from "@prisma/client";

import { db } from "@/lib/prisma";
import { supabase } from "@/app/vendor/supabase-client";

export async function fetchArrayBuffer(url: string) {
  const res = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });
  return res.data;
}

export async function saveSignedPdfResult(params: {
  contractId: string;
  signedUrl: string;
  signedPath: string;
}) {
  return db.offeringContract.update({
    where: { id: params.contractId },
    data: {
      candidateSignedPdfUrl: params.signedUrl,
      candidateSignedPdfPath: params.signedPath,
      candidateSignedPdfAt: new Date(),
    },
  });
}

const SIGNATURE_BUCKET = "web-oss-recruitment";
const SIGNATURE_WIDTH = 180;
const SIGNATURE_HEIGHT = 80;
const SIGNATURE_MARGIN_RIGHT = 48;
const SIGNATURE_MARGIN_LEFT = 52;
const SIGNATURE_MARGIN_BOTTOM = 110;
const SIGNATURE_RELATIVE_X = 0.58;
const MIN_SIGNATURE_Y = 40;

const isPdfUrl = (url: string) => {
  try {
    const clean = new URL(url);
    return /\.pdf$/i.test(clean.pathname);
  } catch {
    return /\.pdf(\?|#|$)/i.test(url);
  }
};

type ContractForSignature = Pick<
  OfferingContract,
  | "id"
  | "filePath"
  | "candidateSignatureUrl"
  | "candidateSignaturePath"
  | "candidateSignedPdfUrl"
>;

export async function applyCandidateSignatureToContract(
  contract: ContractForSignature
) {
  if (!contract.filePath) {
    throw new Error("Contract document is missing.");
  }
  if (!contract.candidateSignatureUrl) {
    throw new Error("Candidate signature is not available.");
  }
  if (!isPdfUrl(contract.filePath)) {
    throw new Error("Contract must be a PDF before applying the signature.");
  }

  const [pdfBytes, signatureBytes] = await Promise.all([
    fetchArrayBuffer(contract.filePath),
    fetchArrayBuffer(contract.candidateSignatureUrl),
  ]);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const png = await pdfDoc.embedPng(signatureBytes);
  const pages = pdfDoc.getPages();
  const targetPage = pages[pages.length - 1];
  const pageWidth = targetPage.getWidth();
  const pageHeight = targetPage.getHeight();

  const relativePositionX = pageWidth * SIGNATURE_RELATIVE_X;
  const minAllowedX = SIGNATURE_MARGIN_LEFT;
  const maxAllowedX = Math.max(
    minAllowedX,
    pageWidth - SIGNATURE_MARGIN_RIGHT - SIGNATURE_WIDTH
  );
  const signatureX = Math.min(
    maxAllowedX,
    Math.max(relativePositionX, minAllowedX)
  );

  const availableHeight =
    pageHeight - SIGNATURE_HEIGHT - SIGNATURE_MARGIN_BOTTOM;
  const signatureY = Math.max(
    MIN_SIGNATURE_Y,
    Math.min(SIGNATURE_MARGIN_BOTTOM, availableHeight)
  );

  targetPage.drawImage(png, {
    x: signatureX,
    y: signatureY,
    width: SIGNATURE_WIDTH,
    height: SIGNATURE_HEIGHT,
  });

  const stampedPdf = await pdfDoc.save();
  const filePath = `candidate-signed/${contract.id}-${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from(SIGNATURE_BUCKET)
    .upload(filePath, stampedPdf, {
      contentType: "application/pdf",
    });
  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(SIGNATURE_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL for signed contract.");
  }

  return saveSignedPdfResult({
    contractId: contract.id,
    signedUrl: data.publicUrl,
    signedPath: filePath,
  });
}
