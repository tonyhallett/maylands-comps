import { saveStateToDbMatchSaveState } from "../../firebase/rtb/match/conversion";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { MatchState, Umpire } from "../../umpire";
import { isMatchWon } from "../../umpire/matchWinState";

interface WithMatch {
  match: DbMatch;
}
export const getDoublesMatch = (withMatches: WithMatch[]) =>
  withMatches[withMatches.length - 1].match;

export function getFullGameScores(matchState: MatchState) {
  const gameScores = [...matchState.completedGameScores];

  const matchWon = isMatchWon(matchState.matchWinState);
  if (!matchWon) {
    gameScores.push({
      team1Points: matchState.team1Score.points,
      team2Points: matchState.team2Score.points,
    });
  }
  return gameScores;
}

export const getDbMatchSaveStateFromUmpire = (umpire: Umpire) => {
  const saveState = umpire.getSaveState();
  return saveStateToDbMatchSaveState(saveState);
};

export const createUmpire = (isDoubles: boolean) =>
  new Umpire(
    {
      bestOf: 5,
      clearBy2: true,
      numServes: 2,
      team1StartGameScore: 0,
      team2StartGameScore: 0,
      upTo: 11,
    },
    isDoubles,
  );
