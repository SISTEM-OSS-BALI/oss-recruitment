export default function generateDesainJobJobCode(jobTitle: string, descriptions: string): string {
  const titlePart = jobTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
  const idPart = descriptions.toString().padStart(4, "0");
  return `DESAINJOB-${titlePart}-${idPart}`;
}