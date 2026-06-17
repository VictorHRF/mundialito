export type ResultType = "exact" | "winner" | "difference" | "none";

export type CalculatePointsInput = {
  homeScore: number;
  awayScore: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  stage: string;
};

export type CalculatePointsResult = {
  points: number;
  resultType: ResultType;
};

function outcome(home: number, away: number) {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function isGroupStage(stage: string) {
  const normalized = stage.toLowerCase();
  return normalized.includes("group") || normalized.includes("grupo");
}

export function calculatePoints({
  homeScore,
  awayScore,
  predictedHomeScore,
  predictedAwayScore,
  stage,
}: CalculatePointsInput): CalculatePointsResult {
  const exact = homeScore === predictedHomeScore && awayScore === predictedAwayScore;
  const sameOutcome =
    outcome(homeScore, awayScore) === outcome(predictedHomeScore, predictedAwayScore);
  const sameDifference =
    homeScore - awayScore === predictedHomeScore - predictedAwayScore;
  const groupStage = isGroupStage(stage);

  if (exact) {
    return { points: groupStage ? 5 : 6, resultType: "exact" };
  }

  if (sameOutcome) {
    return { points: groupStage ? 3 : 4, resultType: "winner" };
  }

  if (sameDifference) {
    return { points: 2, resultType: "difference" };
  }

  return { points: 0, resultType: "none" };
}
