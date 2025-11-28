export type JobDescriptionPayload = {
  companyName: string;
  companySummary: string;
  location: string;
  position: string;
  responsibilities: string[];
  requirements: string[];
  skills?: string[];
  perks?: string[];
  tone?: "professional" | "friendly" | "formal";
};
