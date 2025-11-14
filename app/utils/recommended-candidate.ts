export type Interest = { name?: string; tag?: string };
export type Candidate = {
  id: string;
  name: string;
  interestTags: Interest[]; // relasi User.interestTags
};

export type JobLite = { name: string; description: string };

export type ScoredCandidate = Candidate & {
  score: number;
  matched: string[]; // interest/keyword yang ketemu di job
};

const ID_STOPWORDS = new Set([
  "dan",
  "atau",
  "yang",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dengan",
  "sebagai",
  "dll",
  "pt",
  "cv",
  "tbk",
  "utama",
  "resmi",
  "lowongan",
  "dibutuhkan",
  "kami",
  "anda",
]);
const EN_STOPWORDS = new Set([
  "and",
  "or",
  "the",
  "a",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "with",
  "as",
  "is",
  "are",
  "be",
  "we",
  "you",
]);

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9+#.]+/i)
    .filter(Boolean)
    .filter((w) => !ID_STOPWORDS.has(w) && !EN_STOPWORDS.has(w));
}

// Peta sinonim ringan (bisa kamu tambah sendiri)
const SYNONYMS: Record<string, string[]> = {
  frontend: [
    "front end",
    "front-end",
    "react",
    "nextjs",
    "next.js",
    "ui",
    "tailwind",
    "typescript",
    "javascript",
  ],
  backend: [
    "back end",
    "back-end",
    "node",
    "express",
    "nestjs",
    "prisma",
    "rest",
    "graphql",
  ],
  devops: [
    "docker",
    "kubernetes",
    "k8s",
    "ci/cd",
    "nginx",
    "traefik",
    "aws",
    "gcp",
    "azure",
  ],
  mobile: [
    "flutter",
    "dart",
    "react native",
    "android",
    "ios",
    "kotlin",
    "swift",
  ],
  "data analyst": [
    "analytics",
    "sql",
    "excel",
    "powerbi",
    "tableau",
    "bi",
    "etl",
  ],
  "data engineer": [
    "etl",
    "airflow",
    "spark",
    "hadoop",
    "dbt",
    "warehouse",
    "snowflake",
    "bigquery",
  ],
  ml: [
    "machine learning",
    "pytorch",
    "tensorflow",
    "sklearn",
    "model",
    "inference",
    "nlp",
    "cv",
  ],
  cybersecurity: [
    "security",
    "soc",
    "siem",
    "ids",
    "ips",
    "pentest",
    "forensic",
  ],
};

function buildSynonymIndex(map: Record<string, string[]>) {
  const fwd = map;
  const rev: Record<string, string> = {};
  for (const canon of Object.keys(map)) {
    for (const alt of map[canon]) rev[normalize(alt)] = canon;
    rev[normalize(canon)] = canon;
  }
  return { fwd, rev };
}
const SYN = buildSynonymIndex(SYNONYMS);

/**
 * Hitung skor kecocokan kandidat terhadap sebuah pekerjaan.
 * - +3 untuk kecocokan frasa interest penuh di jobText
 * - +2 untuk kecocokan via sinonim kanonis
 * - +1 per token interest yang muncul di token job (maks 3 per interest)
 */
function scoreCandidate(job: JobLite, cand: Candidate): ScoredCandidate {
  const jobText = normalize(`${job.name} ${job.description}`);
  const jobTokens = new Set(tokenize(jobText));
  const matched: string[] = [];
  let score = 0;

  for (const it of cand.interestTags || []) {
    const raw = (it.name ?? it.tag ?? "").trim();
    if (!raw) continue;

    const interest = normalize(raw);

    // 1) Exact phrase presence
    if (interest && jobText.includes(interest)) {
      score += 3;
      matched.push(raw);
      continue;
    }

    // 2) Synonym/canonical mapping
    const canon = SYN.rev[interest];
    if (canon) {
      const alts = new Set([canon, ...(SYN.fwd[canon] || [])].map(normalize));
      const found = [...alts].some(
        (a) => jobText.includes(a) || jobTokens.has(a)
      );
      if (found) {
        score += 2;
        matched.push(raw);
        continue;
      }
    }

    // 3) Token overlap (maks 3 poin per interest)
    const tokens = tokenize(interest);
    let local = 0;
    for (const t of tokens) {
      if (jobTokens.has(t)) {
        local += 1;
        matched.push(raw);
        if (local >= 3) break;
      }
    }
    score += local;
  }

  return { ...cand, score, matched: Array.from(new Set(matched)) };
}

/**
 * Rekomendasikan kandidat berdasarkan Job.
 * @param job      { name, description }
 * @param candidates daftar kandidat (id, name, interestTags[{name|tag}] )
 * @param opts     { minScore: default 2, limit: optional }
 */
export function recommendCandidates(
  job: JobLite,
  candidates: Candidate[],
  opts?: { minScore?: number; limit?: number }
): ScoredCandidate[] {
  const minScore = opts?.minScore ?? 2;
  const scored = candidates.map((c) => scoreCandidate(job, c));
  const filtered = scored
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return typeof opts?.limit === "number"
    ? filtered.slice(0, opts.limit)
    : filtered;
}

// Export default util sederhana kalau kamu mau bentuk fungsi 1 baris
export default function recommendedCandidate(
  jobName: string,
  userInterest: string[]
) {
  const job: JobLite = { name: jobName, description: "" };
  const candidates: Candidate[] = [
    {
      id: "temp",
      name: "User",
      interestTags: userInterest.map((x) => ({ name: x })),
    },
  ];
  return recommendCandidates(job, candidates)[0]; // kandidat "User" dengan skornya
}
