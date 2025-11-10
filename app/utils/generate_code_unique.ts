// utils/generateCodeUnique.ts
export default function generateCodeUnique(name: string, digits = 8): string {
  // Batasi panjang digit biar aman di Number (<= 15 digit)
  const D = Math.max(1, Math.min(digits, 15));

  const slug = slugifyName(name);
  const min = 10 ** (D - 1);
  const maxExclusive = 10 ** D;

  // Dapatkan integer acak di [min, maxExclusive - 1] tanpa bias
  const n = secureRandomInt(maxExclusive - min) + min;

  // Pastikan jumlah digit konsisten dengan padStart (jika perlu)
  const numberStr = String(n).padStart(D, "0");

  return `${slug}-${numberStr}`;
}

/* -------------------- Helpers -------------------- */

/** Ubah nama jadi SLUG UPPERCASE dengan strip, tanpa aksen */
function slugifyName(input: string): string {
  const base = (input ?? "").toString().trim();
  if (!base) return "NONAME";
  return base
    .normalize("NFKD") // pecah aksen
    .replace(/[\u0300-\u036f]/g, "") // buang diakritik
    .replace(/[^A-Za-z0-9]+/g, "-") // non-alnum -> dash
    .replace(/^-+|-+$/g, "") // trim dash
    .toUpperCase();
}

/**
 * Secure random int uniform di [0, maxExclusive)
 * Menggunakan crypto.randomInt jika ada, fallback ke getRandomValues (48-bit) + rejection sampling.
 */
function secureRandomInt(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive safe integer");
  }

  const cryptoObj: Crypto | undefined = (globalThis as any).crypto;

  // Node 19+/browser modern: punya crypto.randomInt
  const maybeRandomInt = (cryptoObj as any)?.randomInt as
    | ((min: number, max: number) => number)
    | ((max: number) => number)
    | undefined;

  if (typeof maybeRandomInt === "function") {
    // Banyak env mengizinkan randomInt(max) -> [0, max)
    try {
      // @ts-expect-error: overload runtime
      return maybeRandomInt(maxExclusive);
    } catch {
      return maybeRandomInt(0, maxExclusive);
    }
  }

  // Fallback universal: getRandomValues + rejection sampling (48-bit)
  if (!cryptoObj?.getRandomValues) {
    throw new Error("Secure crypto not available (no crypto.getRandomValues)");
  }

  const SOURCE_BITS = 48;
  const SOURCE_SIZE = 2 ** SOURCE_BITS; // 2^48 masih safe di double (≈2.81e14)
  const limit = SOURCE_SIZE - (SOURCE_SIZE % maxExclusive); // hindari bias

  const buf = new Uint16Array(3); // 3 * 16 = 48 bit

  while (true) {
    cryptoObj.getRandomValues(buf);
    // Gabungkan 48-bit ke number (masih aman, < 2^53)
    const x =
      buf[0] * 2 ** 32 + // high 16-bit -> shift 32
      buf[1] * 2 ** 16 + // mid 16-bit -> shift 16
      buf[2]; // low 16-bit
    if (x < limit) {
      return x % maxExclusive;
    }
  }
}
