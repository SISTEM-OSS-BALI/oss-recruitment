import { GoogleGenerativeAI } from "@google/generative-ai";

export type JobSkillSuggestion = {
  name: string;
  category: string;
  isCore: boolean;
};

const skillCache = new Map<
  string,
  { expiresAt: number; value: JobSkillSuggestion[] }
>();

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const GEMINI_TIMEOUT_MS = 8000;

export async function recommendSkills(jobTitle: string, jobRole: string) {
  const key = `${jobTitle.trim().toLowerCase()}::${jobRole
    .trim()
    .toLowerCase()}`;

  const cached = skillCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const skills =
    (await fetchGeminiSkills(jobTitle, jobRole).catch(() => null)) ??
    buildSkillFallback(jobTitle, jobRole);

  skillCache.set(key, {
    value: skills,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return skills;
}

async function fetchGeminiSkills(jobTitle: string, jobRole: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a job skill recommendation engine.

Given:
- Job title: "${jobTitle}"
- Specific job role: "${jobRole}"

Generate a list of exactly 8 skills in this JSON format:
[
  {
    "name": "Skill name in English",
    "category": "Technical" or "Soft Skill" or "Tooling",
    "isCore": true or false
  }
]

Rules:
- The FIRST 5 skills must be core skills (isCore: true) strongly relevant to the job.
- The LAST 3 skills must be supporting skills (isCore: false).
- Mix Technical, Soft Skill, and Tooling where appropriate.
- Return ONLY the JSON array with no extra text.
`;

  const response = (await withTimeout(
    model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
        maxOutputTokens: 512,
      },
    }),
    GEMINI_TIMEOUT_MS,
  )) as Awaited<ReturnType<typeof model.generateContent>>;

  const cleaned = cleanJsonBlock(response.response.text());
  const parsed = safeParseSkillSuggestions(cleaned);
  if (!parsed.length) {
    throw new Error("Gemini returned invalid JSON (skills)");
  }

  return parsed;
}

function safeParseSkillSuggestions(payload: string): JobSkillSuggestion[] {
  try {
    const data = JSON.parse(payload);
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        name: String(item.name ?? "").trim(),
        category: String(item.category ?? "").trim(),
        isCore: Boolean(item.isCore),
      }))
      .filter((item) => item.name && item.category)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function buildSkillFallback(
  jobTitle: string,
  jobRole: string,
): JobSkillSuggestion[] {
  const normalized = `${jobTitle} ${jobRole}`.toLowerCase();

  const preset =
    SKILL_PRESETS.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword)),
    ) ?? DEFAULT_SKILL_PRESET;

  return preset.skills;
}

const SKILL_PRESETS: Array<{
  keywords: string[];
  skills: JobSkillSuggestion[];
}> = [
  {
    keywords: ["engineer", "developer", "software", "data", "it"],
    skills: [
      { name: "Problem Solving", category: "Soft Skill", isCore: true },
      {
        name: "Clean Code & Best Practices",
        category: "Technical",
        isCore: true,
      },
      { name: "Version Control (Git)", category: "Tooling", isCore: true },
      { name: "API Design & Integration", category: "Technical", isCore: true },
      { name: "Testing & Debugging", category: "Technical", isCore: true },
      {
        name: "Communication & Collaboration",
        category: "Soft Skill",
        isCore: false,
      },
      { name: "Agile / Scrum Understanding", category: "Soft Skill", isCore: false },
      { name: "Documentation Writing", category: "Soft Skill", isCore: false },
    ],
  },
  {
    keywords: ["marketing", "brand"],
    skills: [
      { name: "Market Research", category: "Technical", isCore: true },
      { name: "Content Strategy", category: "Technical", isCore: true },
      {
        name: "Digital Marketing Analytics",
        category: "Technical",
        isCore: true,
      },
      { name: "Copywriting", category: "Technical", isCore: true },
      { name: "Brand Positioning", category: "Technical", isCore: true },
      {
        name: "Creativity & Storytelling",
        category: "Soft Skill",
        isCore: false,
      },
      { name: "Presentation Skills", category: "Soft Skill", isCore: false },
      { name: "Collaboration", category: "Soft Skill", isCore: false },
    ],
  },
  {
    keywords: ["finance", "accounting", "analyst"],
    skills: [
      { name: "Financial Analysis", category: "Technical", isCore: true },
      {
        name: "Excel / Spreadsheet Modeling",
        category: "Tooling",
        isCore: true,
      },
      { name: "Budgeting & Forecasting", category: "Technical", isCore: true },
      { name: "Attention to Detail", category: "Soft Skill", isCore: true },
      { name: "Risk Assessment", category: "Technical", isCore: true },
      {
        name: "Communication with Stakeholders",
        category: "Soft Skill",
        isCore: false,
      },
      {
        name: "Presentation of Financial Reports",
        category: "Soft Skill",
        isCore: false,
      },
      { name: "Time Management", category: "Soft Skill", isCore: false },
    ],
  },
  {
    keywords: ["hr", "human resource", "recruiter"],
    skills: [
      { name: "Interviewing & Assessment", category: "Technical", isCore: true },
      { name: "Candidate Screening", category: "Technical", isCore: true },
      { name: "Employee Relations", category: "Technical", isCore: true },
      { name: "Communication & Empathy", category: "Soft Skill", isCore: true },
      { name: "Conflict Resolution", category: "Soft Skill", isCore: true },
      { name: "HRIS / ATS Tools", category: "Tooling", isCore: false },
      { name: "Data Entry & Reporting", category: "Technical", isCore: false },
      { name: "Time Management", category: "Soft Skill", isCore: false },
    ],
  },
];

const DEFAULT_SKILL_PRESET = {
  keywords: [] as string[],
  skills: [
    { name: "Communication", category: "Soft Skill", isCore: true },
    { name: "Problem Solving", category: "Soft Skill", isCore: true },
    { name: "Collaboration & Teamwork", category: "Soft Skill", isCore: true },
    { name: "Basic Digital Literacy", category: "Technical", isCore: true },
    { name: "Time Management", category: "Soft Skill", isCore: true },
    { name: "Adaptability", category: "Soft Skill", isCore: false },
    { name: "Presentation Skills", category: "Soft Skill", isCore: false },
    { name: "Documentation", category: "Technical", isCore: false },
  ],
};

function cleanJsonBlock(raw: string) {
  const text = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end >= start) {
    return text.slice(start, end + 1);
  }

  return text;
}

async function withTimeout<T>(promise: Promise<T>, timeout: number) {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Gemini request timeout"));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
