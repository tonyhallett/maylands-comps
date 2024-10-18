import {
  saveStateToDbMatchSaveState,
  dbMatchSaveStateToSaveState,
} from "../src/firebase/rtb/match/conversion";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";
import { SaveState, Umpire, Player, GameScore } from "../src/umpire";
import {
  winGame,
  scoreGameScores,
  scorePoints,
  scoreGamesWon,
} from "../src/umpire/umpireHelpers";

export const updateDbMatchWithSaveState = (
  match: DbMatch,
  saveState: SaveState,
) => {
  const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
  for (const key in dbMatchSaveState) {
    match[key] = dbMatchSaveState[key];
  }
};

export const updateMatchViaUmpire = (
  match: DbMatch,
  umpireUpdate: (umpire: Umpire) => void,
) => {
  const umpire = new Umpire(dbMatchSaveStateToSaveState(match));
  umpireUpdate(umpire);
  const saveState = umpire.getSaveState();
  updateDbMatchWithSaveState(match, saveState);
};
export const matchWinGame = (
  match: DbMatch,
  homeWins: boolean,
  server: Player = "Team1Player1",
) => {
  updateMatchViaUmpire(match, (umpire) => {
    umpire.setServer(server);
    winGame(umpire, homeWins);
  });
};

export const matchScoreGameScores = (
  match: DbMatch,
  gameScores: GameScore[],
  server: Player = "Team1Player1",
) => {
  updateMatchViaUmpire(match, (umpire) => {
    umpire.setServer(server);
    scoreGameScores(umpire, gameScores);
  });
};

export const matchScorePoints = (
  match: DbMatch,
  isHome: boolean,
  points = 1,
  server: Player = "Team1Player1",
) => {
  updateMatchViaUmpire(match, (umpire) => {
    umpire.setServer(server);
    scorePoints(umpire, isHome, points);
  });
};

export const matchScoreGamesWon = (
  match: DbMatch,
  homeTeamGamesWon: number,
  awayTeamGamesWon: number,
  server: Player = "Team1Player1",
) => {
  updateMatchViaUmpire(match, (umpire) => {
    umpire.setServer(server);
    scoreGamesWon(umpire, homeTeamGamesWon, awayTeamGamesWon);
  });
};
