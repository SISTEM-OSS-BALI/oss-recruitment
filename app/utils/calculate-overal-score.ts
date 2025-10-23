type Answer = { questionId: string; value: unknown };
type QuestionMeta = { id: string; maxScore: number; weight?: number };

function toNumber(x: unknown): number | null {
  if (x == null) return null;
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  // boolean → 1/0 (opsional)
  if (typeof x === "boolean") return x ? 1 : 0;
  return null;
}

function computeOverall(
  answers: Answer[],
  metas: QuestionMeta[],
  { round = true, ignoreMissing = true } = {}
): number | null {
  const metaById = new Map(metas.map((m) => [m.id, m]));
  const items: { norm: number; weight: number }[] = [];

  for (const a of answers) {
    const meta = metaById.get(a.questionId);
    if (!meta || !meta.maxScore || meta.maxScore <= 0) continue;

    const raw = toNumber(a.value);
    if (raw == null) {
      if (!ignoreMissing) items.push({ norm: 0, weight: meta.weight ?? 1 });
      continue;
    }

    // clamp raw ke [0, maxScore]
    const clamped = Math.max(0, Math.min(meta.maxScore, raw));
    const normalized = (clamped / meta.maxScore) * 100; // 0..100
    items.push({ norm: normalized, weight: meta.weight ?? 1 });
  }

  if (!items.length) return null;

  // normalisasi bobot (supaya total = 1)
  const totalW = items.reduce((s, it) => s + it.weight, 0);
  const overall = items.reduce(
    (s, it) => s + it.norm * (it.weight / totalW),
    0
  );

  return round ? Math.round(overall) : overall; // simpan integer 0..100
}
export { computeOverall, toNumber };