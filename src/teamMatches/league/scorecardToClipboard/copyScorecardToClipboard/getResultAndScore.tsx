export interface ResultAndScore {
  result: string;
  score: string;
}

export function getScore(highest: number, lowest?: number) {
  return `${highest} - ${lowest === undefined ? highest : lowest}`;
}

export const getResultAndScore = (
  homeTeamScore: number,
  awayTeamScore: number,
  homeTeamName: string,
  awayTeamName: string,
): ResultAndScore => {
  if (homeTeamScore === awayTeamScore) {
    return { result: "Draw", score: getScore(homeTeamScore) };
  } else {
    const result = homeTeamScore > awayTeamScore ? homeTeamName : awayTeamName;
    const winnerScore = Math.max(homeTeamScore, awayTeamScore);
    const loserScore = Math.min(homeTeamScore, awayTeamScore);
    const score = getScore(winnerScore, loserScore);
    return { result, score };
  }
};
