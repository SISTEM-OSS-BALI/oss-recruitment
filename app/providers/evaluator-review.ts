import db from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* =========================
   Error helper
========================= */
type GeneralErrorParams = {
  message?: string;
  error?: string;
  code?: number;
  error_code?: string;
  details?: unknown;
};

class GeneralError extends Error {
  code: number;
  error_code?: string;
  details?: unknown;
  error?: string;

  constructor(message: string, code?: number, error_code?: string, details?: unknown);
  constructor(options: GeneralErrorParams);
  constructor(
    messageOrOptions: string | GeneralErrorParams,
    code = 400,
    error_code?: string,
    details?: unknown
  ) {
    if (typeof messageOrOptions === "string") {
      super(messageOrOptions);
      this.error = messageOrOptions;
      this.code = code;
      this.error_code = error_code;
      this.details = details;
      return;
    }

    const {
      message,
      error,
      code: optionCode = 400,
      error_code: optionErrorCode,
      details: optionDetails,
    } = messageOrOptions;

    const resolvedMessage = message ?? error ?? "Unknown error";
    super(resolvedMessage);
    this.error = error ?? resolvedMessage;
    this.code = optionCode;
    this.error_code = optionErrorCode;
    this.details = optionDetails;
  }
}

/* =========================
   Utils: ambil angka dari value
========================= */
function extractNumeric(v: unknown): number | null {
  if (v == null) return null;

  if (typeof v === "number" && Number.isFinite(v)) return v;

  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof v === "boolean") return v ? 1 : 0;

  if (Array.isArray(v)) {
    const nums = v
      .map(extractNumeric)
      .filter((x): x is number => typeof x === "number");
    if (!nums.length) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return sum / nums.length;
  }

  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if ("score" in obj) {
      const n = extractNumeric(obj.score);
      if (typeof n === "number") return n;
    }
    if ("value" in obj) {
      const n = extractNumeric(obj.value);
      if (typeof n === "number") return n;
    }
  }

  return null;
}

/* =========================
   Utils: hitung overall dengan metadata (0..100)
   - Normalisasi per-pertanyaan: (raw / maxScore) * 100
   - Weighted average (default weight=1 kalau null)
========================= */
type Answer = { questionId: string; value: unknown };
type QuestionMeta = {
  id: string;
  maxScore: number | null;
  weight?: number | null;
};

function computeOverall(
  answers: Answer[],
  metas: QuestionMeta[],
  {
    round = true,
    ignoreMissing = true,
  }: { round?: boolean; ignoreMissing?: boolean } = {}
): number | null {
  if (!answers.length) return null;

  const metaById = new Map(metas.map((m) => [m.id, m]));
  const items: { norm: number; weight: number }[] = [];

  for (const a of answers) {
    const meta = metaById.get(a.questionId);
    if (!meta || !meta.maxScore || meta.maxScore <= 0) continue;

    const raw = extractNumeric(a.value);
    if (raw == null) {
      if (!ignoreMissing) items.push({ norm: 0, weight: meta.weight ?? 1 });
      continue;
    }

    // clamp ke [0, maxScore], lalu normalisasi 0..100
    const clamped = Math.max(0, Math.min(meta.maxScore, raw));
    const normalized = (clamped / meta.maxScore) * 100;
    items.push({ norm: normalized, weight: meta.weight ?? 1 });
  }

  if (!items.length) return null;

  const totalW = items.reduce((s, it) => s + it.weight, 0);
  const overall = items.reduce(
    (s, it) => s + it.norm * (it.weight / totalW),
    0
  );

  return round ? Math.round(overall) : overall;
}

/* =========================
   Utils: fallback jika tak ada metadata
   - Ambil angka mentah lalu rata-ratakan
   - Konversi ke 0..100 opsional (di sini tdk, biarkan mentah)
========================= */
function fallbackAverage(
  answers: Answer[],
  { round = true } = {}
): number | null {
  const nums = answers
    .map((a) => extractNumeric(a.value))
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  if (!nums.length) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return round ? Math.round(avg) : avg;
}

/* =========================
   Facade yang kamu panggil di bawah:
   - Usaha pakai metadata (maxScore, weight)
   - Kalau tidak ada kolomnya → fallback
========================= */
async function calculateOverallScoreFromAnswersTX(
  tx: Prisma.TransactionClient,
  answers: Answer[]
): Promise<number | null> {
  const qids = answers.map((a) => a.questionId);

  try {
    // Ambil meta; jika kolom tidak ada, Prisma akan error → catch → fallback
    const metas = await tx.matriksQuestion.findMany({
      where: { id: { in: qids } },
      select: { id: true, maxScore: true, weight: true } as const,
    });

    // Jika tidak ada meta usable, fallback
    const hasUsableMeta = metas.some((m) => m.maxScore && m.maxScore > 0);
    if (!hasUsableMeta) return fallbackAverage(answers);

    return computeOverall(answers, metas);
  } catch (e: unknown) {
    throw e;
    return fallbackAverage(answers);
  }
}

/* =========================
   Handler utama
========================= */
export const SUBMIT_EVALUATOR_ASSIGNMENT_ANSWERS = async (
  id: string,
  answers: Array<{ questionId: string; value: unknown }>
) => {
  if (!id)
    throw new GeneralError({
      code: 400,
      details: "id wajib diisi",
      error: "id wajib diisi",
      error_code: "MISSING_ASSIGNMENT_ID",
    });
  if (!Array.isArray(answers))
    throw new GeneralError({
      code: 400,
      details: "answers harus array",
      error: "answers harus array",
      error_code: "INVALID_ANSWERS_TYPE",
    });
  if (answers.length === 0)
    throw new GeneralError({
      code: 400,
      details: "answers tidak boleh kosong",
      error: "answers tidak boleh kosong",
      error_code: "EMPTY_ANSWERS",
    });

  return await db.$transaction(async (tx) => {
    // 1) Cek assignment
    const assignment = await tx.evaluatorAssignment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!assignment)
      throw new GeneralError({
        code: 404,
        details: "EvaluatorAssignment tidak ditemukan",
        error: "EvaluatorAssignment tidak ditemukan",
        error_code: "ASSIGNMENT_NOT_FOUND",
      });

    // 2) Validasi questionId
    const qids = answers.map((a) => a.questionId);
    const validQs = await tx.matriksQuestion.findMany({
      where: { id: { in: qids } },
      select: { id: true },
    });
    const validSet = new Set(validQs.map((q) => q.id));
    const invalid = qids.filter((q) => !validSet.has(q));
    if (invalid.length) {
      throw new GeneralError(
        `questionId tidak valid: ${invalid.join(", ")}`,
        400,
        "INVALID_QUESTION_IDS",
        { invalid }
      );
    }

    // 3) Tulis jawaban (idempotent)
    await tx.evaluatorReview.deleteMany({ where: { assignmentId: id } });

    for (const a of answers) {
      if (!a?.questionId) continue;
      await tx.evaluatorReview.upsert({
        where: {
          assignmentId_questionId: {
            assignmentId: id,
            questionId: a.questionId,
          },
        },
        update: { value: a.value as Prisma.InputJsonValue },
        create: {
          assignmentId: id,
          questionId: a.questionId,
          value: a.value as Prisma.InputJsonValue,
        },
      });
    }

    // 4) Hitung overallScore (prioritas pakai metadata → fallback rata-rata)
    const overallScore = await calculateOverallScoreFromAnswersTX(tx, answers);

    // 5) Update assignment
    const updated = await tx.evaluatorAssignment.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        overallScore: overallScore, // overall dalam 0..100 jika pakai meta; kalau fallback = rata-rata mentah
      },
      include: { answers: true },
    });

    return updated;
  });
};
