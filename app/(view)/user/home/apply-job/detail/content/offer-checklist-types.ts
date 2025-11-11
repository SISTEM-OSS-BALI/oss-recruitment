import type { ReactNode } from "react";

export type OfferChecklistKey =
  | "contractFinalized"
  | "signatureDirectur"
  | "decisionCandidate"
  | "generateCard";

export type OfferChecklistItem = {
  key: OfferChecklistKey;
  title: string;
  description: string;
  fileUrl?: string;
  icon: ReactNode;
  disabled?: boolean;
};
