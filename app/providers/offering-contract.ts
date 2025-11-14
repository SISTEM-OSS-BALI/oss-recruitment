import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { GeneralError } from "../utils/general-error";
import { applyCandidateSignatureToContract } from "../vendor/contract-signature";
import type {
  OfferDecisionValue,
  OfferingContractPayloadCreateModel,
  DirectorSignatureUploadPayload,
} from "../models/offering-contract";

export const GET_OFFERING_CONTRACTS = async () => {
  const result = await db.offeringContract.findMany({
    include: {
      applicant: {
        include: {
          user: true,
          job: true,
        },
      },
    },
  });
  return result;
};

export const GET_OFFERING_CONTRACT = async (id: string) => {
  const result = await db.offeringContract.findUnique({
    where: {
      id,
    },
    include: {
      applicant: {
        include: {
          user: true,
          job: true,
        },
      },
    },
  });
  return result;
};
export const CREATE_OFFERING_CONTRACT = async (
  payload: OfferingContractPayloadCreateModel
) => {
  const result = await db.offeringContract.create({
    data: payload,
  });

  return result;
};

export const UPDATE_OFFERING_CONTRACT = async (
  id: string,
  payload: OfferingContractPayloadCreateModel
) => {
  const result = await db.offeringContract.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_OFFERING_CONTRACT = async (id: string) => {
  const result = await db.offeringContract.delete({
    where: {
      id,
    },
  });
  return result;
};

export const GET_OFFERING_CONTRACT_BY_APPLICATION_ID = async (
  applicant_id: string
) => {
  const result = await db.offeringContract.findFirst({
    where: {
      applicant_id,
    },
  });
  return result;
};

type CandidateDecisionPayload = {
  applicant_id: string;
  decision: OfferDecisionValue;
  signatureUrl?: string | null;
  signaturePath?: string | null;
  rejectionReason?: string | null;
};

export const UPDATE_OFFERING_CONTRACT_CANDIDATE_DECISION = async ({
  applicant_id,
  decision,
  signatureUrl,
  signaturePath,
  rejectionReason,
}: CandidateDecisionPayload) => {
  if (!applicant_id) {
    throw new GeneralError({
      code: 400,
      error: "Bad Request",
      error_code: "BAD_REQUEST",
      details: "applicant_id is required",
    });
  }

  const existing = await db.offeringContract.findFirst({
    where: { applicant_id },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    throw new GeneralError({
      code: 404,
      error: "Not Found",
      error_code: "OFFER_CONTRACT_NOT_FOUND",
      details: "No offering contract found for this applicant",
    });
  }

  const now = new Date();

  const data: Prisma.OfferingContractUncheckedUpdateInput = {
    candidateDecision: decision,
    candidateDecisionAt: decision === "PENDING" ? null : now,
  };

  if (decision === "ACCEPTED") {
    data.candidateSignatureUrl =
      signatureUrl ?? existing.candidateSignatureUrl ?? null;
    data.candidateSignaturePath =
      signaturePath ?? existing.candidateSignaturePath ?? null;
    data.candidateSignatureSignedAt =
      signatureUrl || signaturePath ? now : existing.candidateSignatureSignedAt;
    data.candidateRejectionReason = null;
  } else if (decision === "DECLINED") {
    data.candidateSignatureUrl = null;
    data.candidateSignaturePath = null;
    data.candidateSignatureSignedAt = null;
    data.candidateRejectionReason = rejectionReason ?? null;
  } else {
    data.candidateSignatureUrl = null;
    data.candidateSignaturePath = null;
    data.candidateSignatureSignedAt = null;
    data.candidateRejectionReason = null;
  }

  let updated = await db.offeringContract.update({
    where: { id: existing.id },
    data,
  });

  if (decision === "ACCEPTED") {
    try {
      updated = await applyCandidateSignatureToContract(updated);
    } catch (error) {
      console.error("Failed to apply candidate signature automatically:", error);
      throw new GeneralError({
        code: 500,
        error: "Failed to generate signed contract",
        error_code: "APPLY_CANDIDATE_SIGNATURE_FAILED",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while generating signed PDF.",
      });
    }
  }

  return updated;
};

export const MARK_DIRECTOR_SIGNATURE_REQUESTED = async (id: string) => {
  const now = new Date();
  const updated = await db.offeringContract.update({
    where: { id },
    data: { directorSignatureRequestedAt: now },
  });
  return updated;
};

export const UPDATE_DIRECTOR_SIGNATURE_DOCUMENT = async ({
  contractId,
  signatureUrl,
  signaturePath,
}: DirectorSignatureUploadPayload) => {
  const data: Prisma.OfferingContractUncheckedUpdateInput = {
    directorSignatureUrl: signatureUrl,
    directorSignaturePath: signaturePath,
    directorSignatureSignedAt:
      signatureUrl && signaturePath ? new Date() : null,
  };

  if (!signatureUrl || !signaturePath) {
    data.directorSignatureUrl = null;
    data.directorSignaturePath = null;
    data.directorSignatureSignedAt = null;
  }

  const updated = await db.offeringContract.update({
    where: { id: contractId },
    data,
  });

  return updated;
};
