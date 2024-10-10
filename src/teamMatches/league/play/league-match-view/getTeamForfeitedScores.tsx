import { Score } from "../../../../scoreboardToClipboard/drawTable";

export function getTeamForfeitedScores(isHome: boolean): Score[] {
  const forfeitKey = isHome ? "home" : "away";
  const notForfeitKey = isHome ? "away" : "home";
  return [1, 2, 3].map(() => {
    return {
      [forfeitKey]: 0,
      [notForfeitKey]: 11,
    } as unknown as Score;
  });
}
