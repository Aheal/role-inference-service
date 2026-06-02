import type { ScoredCandidate } from "./role-scorer.js";

export function buildExplanation(
  best: ScoredCandidate | null,
  status: string,
  conflictSignals: string[]
) {
  if (!best) {
    return "Insufficient profile data to infer a role. No reliable title, department, skill, group, manager, or note signals were available.";
  }

  const parts = best.matchedSignals.slice(0, 4);
  if (conflictSignals.length > 0) {
    parts.push(`Conflicts lowered confidence: ${conflictSignals.join(" ")}`);
  }

  if (status === "needs_review") {
    parts.push("The result needs review because confidence is limited, signals conflict, or top candidates are close.");
  }

  return parts.join(" ");
}

