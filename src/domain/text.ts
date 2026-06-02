const aliases = new Map<string, string>([
  ["sr", "senior"],
  ["bi", "business intelligence"],
  ["revops", "revenue operations"],
  ["devops", "platform infrastructure"],
  ["cx", "customer success"],
  ["outcomes", "success"],
  ["experience", "success"],
  ["qbrs", "customer business reviews"],
  ["escalations", "escalation"],
  ["renewals", "renewal"],
  ["admins", "admin"],
  ["users", "user"]
]);

const stopWords = new Set([
  "of",
  "the",
  "and",
  "a",
  "an",
  "team",
  "all",
  "staff",
  "users",
  "user",
  "admin",
  "admins",
  "ii",
  "iii"
]);

export function normalizeText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const ascii = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  const expanded = ascii
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((token) => aliases.get(token) ?? token)
    .join(" ");

  return expanded.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function tokenize(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(" ")
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

export function tokenSet(values: Array<string | null | undefined>) {
  return new Set(values.flatMap((value) => tokenize(value)));
}

export function overlapRatio(sourceTokens: Set<string>, targetTokens: Set<string>) {
  if (sourceTokens.size === 0 || targetTokens.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const token of sourceTokens) {
    if (targetTokens.has(token)) {
      matches += 1;
    }
  }

  return matches / Math.min(sourceTokens.size, targetTokens.size);
}

export function titleSimilarity(source: string | null | undefined, target: string) {
  const sourceTokens = tokenSet([source]);
  const targetTokens = tokenSet([target]);
  const overlap = overlapRatio(sourceTokens, targetTokens);
  const normalizedSource = normalizeText(source);
  const normalizedTarget = normalizeText(target);

  if (!normalizedSource || !normalizedTarget) {
    return 0;
  }

  if (normalizedSource === normalizedTarget) {
    return 1;
  }

  if (normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource)) {
    return Math.max(overlap, 0.85);
  }

  return overlap;
}

