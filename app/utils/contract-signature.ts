import axios from "axios";
import { db } from "@/lib/prisma";

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
