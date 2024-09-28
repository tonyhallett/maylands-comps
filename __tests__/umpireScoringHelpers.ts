import { GameScore, Umpire } from "../src/umpire";

export const scorePoints = (umpire: Umpire, team1: boolean, n: number) => {
  [...Array(n)].forEach(() => umpire.pointScored(team1));
  return umpire.getMatchState();
};
export const scoreGames = (
  umpire: Umpire,
  team1: boolean,
  n: number,
  gamePoints = 11,
) => {
  [...Array(n)].forEach(() => scorePoints(umpire, team1, gamePoints));
  return umpire.getMatchState();
};

export const scoreGameScores = (umpire: Umpire, gameScores: GameScore[]) => {
  const scorePointsIfNotZero = (homeTeam: boolean, scores: number) => {
    if (scores > 0) {
      scorePoints(umpire, homeTeam, scores);
    }
  };

  gameScores.forEach((gameScore) => {
    let firstTeam1 = true;
    let scoresFirst = gameScore.team1Points;
    let scoresSecond = gameScore.team2Points;
    if (scoresFirst > scoresSecond) {
      const temp = scoresFirst;
      scoresFirst = scoresSecond;
      scoresSecond = temp;
      firstTeam1 = false;
    }

    scorePointsIfNotZero(firstTeam1, scoresFirst);
    scorePointsIfNotZero(!firstTeam1, scoresSecond);
  });
};
