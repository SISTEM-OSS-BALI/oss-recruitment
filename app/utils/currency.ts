export const formatCurrencyIDR = (
  value?: string | number | null
): string => {
  if (value === undefined || value === null || value === "") return "";

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d]/g, ""));

  if (!Number.isFinite(numeric)) return "";

  return `Rp ${numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};

export const parseCurrencyToNumber = (value?: string | null): number | null => {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isNaN(parsed) ? null : parsed;
};
