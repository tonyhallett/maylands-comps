import { GameScore, GameWonState } from "../../../../umpire";
import { Score } from "../../../../scoreboardToClipboard/drawTable";
import { getGameWonState } from "../../../../umpire/getGameWonState";
import { ExtractKey } from "../../../../firebase/rtb/typeHelpers";

export type ScoreKey = ExtractKey<Score, "home" | "away">;
export function getConcededScores(
  gameScores: GameScore[],
  homeConcede: boolean,
): Score[] {
  //should only be the one
  gameScores = gameScores.filter(
    (gameScore) =>
      !(gameScore.team1Points === 0 && gameScore.team2Points === 0),
  );

  const scoreConcededKey: ScoreKey = homeConcede ? "home" : "away";
  const scoreNotConcededKey: ScoreKey = homeConcede ? "away" : "home";

  let homeWinCount = 0;
  let awayWinCount = 0;
  const scores = gameScores.map((gameScore) => {
    const gameWonState = getGameWonState(
      gameScore.team1Points,
      gameScore.team2Points,
      11,
      true,
    );
    if (gameWonState === GameWonState.NotWon) {
      if (homeConcede) {
        awayWinCount++;
      } else {
        homeWinCount++;
      }
      const concedePoints = homeConcede
        ? gameScore.team1Points
        : gameScore.team2Points;

      let notConcedePoints = 11;
      if (concedePoints >= 10) {
        notConcedePoints = concedePoints + 2;
      }
      return {
        [scoreConcededKey]: concedePoints,
        [scoreNotConcededKey]: notConcedePoints,
      } as unknown as Score;
    } else {
      if (gameWonState === GameWonState.Team1Won) {
        homeWinCount++;
      } else {
        awayWinCount++;
      }
      const score = {
        home: gameScore.team1Points,
        away: gameScore.team2Points,
      };
      return score;
    }
  });

  // also need to add the missing
  let winCount = Math.max(homeWinCount, awayWinCount);
  while (winCount < 3) {
    scores.push({
      [scoreConcededKey]: 0,
      [scoreNotConcededKey]: 11,
    } as unknown as Score);
    winCount++;
  }
  return scores;
}
