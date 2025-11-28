import { GoogleGenerativeAI } from "@google/generative-ai";

type JobRoleSuggestion = {
  title: string;
  category: string;
  isRecommended: boolean;
};

const suggestionCache = new Map<
  string,
  { expiresAt: number; value: JobRoleSuggestion[] }
>();
const CACHE_TTL_MS = 1000 * 60 * 10; 
const GEMINI_TIMEOUT_MS = 8000;

export async function recommendJobRoles(jobTitle: string) {
  const normalizedTitle = jobTitle.trim().toLowerCase();
  const cached = suggestionCache.get(normalizedTitle);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const suggestions =
    (await fetchGeminiRecommendation(jobTitle).catch(() => {
      return null;
    })) ?? buildFallbackResponse(jobTitle);

  suggestionCache.set(normalizedTitle, {
    value: suggestions,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return suggestions;
}

async function fetchGeminiRecommendation(jobTitle: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a job role recommendation engine.

Given the job title: "${jobTitle}"

Generate a list of exactly 4 job roles with this JSON format:
[
  {
    "title": "Name of job role",
    "category": "Category such as Computer & Software, Marketing, Design, HR, Finance",
    "isRecommended": true or false
  }
]

Rules:
- The FIRST 3 items must be highly relevant to the job title and set "isRecommended": true.
- The LAST item must be from a different category and "isRecommended": false.
- Return ONLY the JSON array without explanation.
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
  const parsed = safeParseSuggestions(cleaned);
  if (!parsed.length) {
    throw new Error("Gemini returned invalid JSON");
  }

  return parsed;
}

function cleanJsonBlock(raw: string) {
  const text = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end >= start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function safeParseSuggestions(payload: string): JobRoleSuggestion[] {
  try {
    const data = JSON.parse(payload);
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        title: String(item.title ?? "").trim(),
        category: String(item.category ?? "").trim(),
        isRecommended: Boolean(item.isRecommended),
      }))
      .filter((item) => item.title && item.category)
      .slice(0, 4);
  } catch {
    return [];
  }
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

function buildFallbackResponse(jobTitle: string): JobRoleSuggestion[] {
  const normalized = jobTitle.toLowerCase();
  const category =
    Object.entries(keywordCategoryMap).find(([keyword]) =>
      normalized.includes(keyword),
    )?.[1] ?? "General Management";

  const baseTitle = capitalizeWords(jobTitle);
  const alternatives = alternateCategories.find(
    (entry) => entry.category !== category,
  );

  return [
    {
      title: `${baseTitle} Specialist`,
      category,
      isRecommended: true,
    },
    {
      title: `${baseTitle} Lead`,
      category,
      isRecommended: true,
    },
    {
      title: `${baseTitle} Coordinator`,
      category,
      isRecommended: true,
    },
    {
      title: alternatives
        ? alternatives.sample
        : "Cross Functional Operations Associate",
      category: alternatives ? alternatives.category : "Operations",
      isRecommended: false,
    },
  ];
}

const keywordCategoryMap: Record<string, string> = {
  engineer: "Computer & Software",
  developer: "Computer & Software",
  software: "Computer & Software",
  data: "Computer & Software",
  marketing: "Marketing",
  sales: "Sales & Business",
  finance: "Finance",
  accounting: "Finance",
  hr: "Human Resources",
  recruiter: "Human Resources",
  designer: "Design & Creative",
  ux: "Design & Creative",
  ui: "Design & Creative",
  product: "Product Management",
  supply: "Operations & Supply Chain",
  operation: "Operations & Supply Chain",
};

const alternateCategories = [
  { category: "Marketing", sample: "Brand Strategy Analyst" },
  { category: "Finance", sample: "Financial Planning Associate" },
  { category: "Human Resources", sample: "People Operations Generalist" },
  { category: "Computer & Software", sample: "Digital Transformation Analyst" },
];

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
