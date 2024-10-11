import { Score } from "../../../scorecardToClipboard/drawTable";
import { ScoreKey } from "./ScoreKey";

export function getTeamForfeitedScores(isHome: boolean): Score[] {
  const forfeitKey: ScoreKey = isHome ? "home" : "away";
  const notForfeitKey: ScoreKey = isHome ? "away" : "home";
  return [1, 2, 3].map(() => {
    return {
      [forfeitKey]: 0,
      [notForfeitKey]: 11,
    } as unknown as Score;
  });
}
