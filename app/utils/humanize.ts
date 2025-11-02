// src/app/utils/humanize.ts

/**
 * Convert CONSTANT_CASE / snake_case / kebab-case into Title Case.
 * Examples:
 *  - "SINGLE_CHOICE" -> "Single Choice"
 *  - "MULTIPLE_CHOICE" -> "Multiple Choice"
 *  - "TEXT" -> "Text"
 *  - "allowMultipleSubmissions" -> "Allow Multiple Submissions" (optional camelCase support)
 */
export function humanize(
  input: string,
  opts?: {
    /**
     * Provide overrides for tokens or full strings.
     * e.g. { ID: "ID", QA: "QA", UI: "UI" }
     */
    overrides?: Record<string, string>;
    /** If true, will also split camelCase/PascalCase into words. Default: true */
    splitCamelCase?: boolean;
  }
): string {
  const { overrides = {}, splitCamelCase = true } = opts || {};

  if (!input) return "";

  // If user provides a full-string override, apply it directly
  if (overrides[input]) return overrides[input];

  // 1) Normalize: replace separators with spaces
  let s = input.replace(/[_\-]+/g, " ");

  // 2) Optionally split camelCase/PascalCase into words (AllowMultipleSubmissions -> Allow Multiple Submissions)
  if (splitCamelCase) {
    s = s
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  }

  // 3) Lowercase then Title Case each word
  const words = s.trim().toLowerCase().split(/\s+/);

  const titled = words
    .map((w) => {
      // Per-word override first (after lowercase)
      const upperKey = w.toUpperCase();
      if (overrides[upperKey]) return overrides[upperKey];

      // Title-case default
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");

  return titled;
}

/**
 * Convenience helper specifically for enum-like types (e.g., "SINGLE_CHOICE").
 * Customize common acronyms via overrides if desired.
 */
export function prettyType(raw: string) {
  return humanize(raw, {
    overrides: {
      ID: "ID",
      QA: "QA",
      UI: "UI",
      UX: "UX",
    },
  });
}

 export const humanizeType = (type: string) => {
    switch (type) {
      case "HEAD_OFFICE":
        return "Head Office";
      case "BRANCH_OFFICE":
        return "Branch Office";
      default:
        return type;
    }
  };
