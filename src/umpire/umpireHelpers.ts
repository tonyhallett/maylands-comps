import { GameScore, Umpire } from ".";

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

export const winGame = (umpire: Umpire, team1: boolean) => {
  scoreGames(umpire, team1, 3);
};
export const scoreGamesWon = (
  umpire: Umpire,
  team1GamesWon: number,
  team2GamesWon: number,
) => {
  if (team1GamesWon > team2GamesWon) {
    scoreGames(umpire, false, team2GamesWon);
    scoreGames(umpire, true, team1GamesWon);
  } else {
    scoreGames(umpire, true, team1GamesWon);
    scoreGames(umpire, false, team2GamesWon);
  }
};

export const scoreGameScores = (umpire: Umpire, gameScores: GameScore[]) => {
  gameScores.forEach((gameScore) => {
    let firstTeam1 = true;
    let scoresFirst = gameScore.team1Points;
    let scoresSecond = gameScore.team2Points;
    const max = Math.max(scoresFirst, scoresSecond);
    if (scoresFirst > scoresSecond) {
      const temp = scoresFirst;
      scoresFirst = scoresSecond;
      scoresSecond = temp;
      firstTeam1 = false;
    }
    for (let i = 0; i < max; i++) {
      if (i < scoresFirst) {
        umpire.pointScored(firstTeam1);
      }
      if (i < scoresSecond) {
        umpire.pointScored(!firstTeam1);
      }
    }
  });
};
