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

  if (!sameOutcome) return { points: 0, resultType: "none" };

  let points = groupStage ? 2 : 3;
  let resultType: ResultType = "winner";

  if (sameDifference) {
    points += 1;
    resultType = "difference";
  }

  if (exact) {
    points += 2;
    resultType = "exact";
  }

  return { points, resultType };
}
