import { within } from "@testing-library/react";
import { findScoresheetSection } from "./leagueMatchViewSelectors";
import {
  gameMenuButtonAriaLabel,
  getLeagueMatchResultTeamElementAriaLabel,
  getMatchOrderCellAriaLabel,
  getScoresheetGameRowAriaLabel,
  scoresheetLeagueMatchResultCellAriaLabel,
  scoresheetLeagueMatchResultRowAriaLabel,
  scoresheetTableAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/LeagueMatchView";
import { fillArray } from "../src/helpers/fillArray";
import {
  getGameScoreCellAriaLabel,
  getGameScoreCellTeamAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getGameScoreCell";
import {
  gameWinnerAriaLabel,
  gamesWonAriaLabel,
  getTeamGamesWonAriaLabel,
  winnerAndGamesWonCellAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getResultsCell";
import {
  doublesPlayerAriaLabel,
  getScoresheetGamePlayerCellAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getPlayerCell";

export const findScoresheetTable = async () => {
  const scoresheetSection = await findScoresheetSection();
  return within(scoresheetSection).getByLabelText<HTMLTableElement>(
    scoresheetTableAriaLabel,
  );
};
export const findAllGameRows = async () => {
  const scoresheetTable = await findScoresheetTable();
  return fillArray(10, (i) => {
    return findGameRowWithin(scoresheetTable, i);
  });
};

const findGameRowWithin = (
  scoresheetTable: HTMLTableElement,
  index: number,
) => {
  return within(scoresheetTable).getByLabelText<HTMLTableRowElement>(
    getScoresheetGameRowAriaLabel(index + 1),
  );
};

export const findGameRow = async (index: number) => {
  const scoresheetTable = await findScoresheetTable();
  return findGameRowWithin(scoresheetTable, index);
};

export const findGameMenuButton = async (index: number) => {
  const gameRow = await findGameRow(index);
  return within(gameRow).getByLabelText(gameMenuButtonAriaLabel);
};

const findLeagueMatchResultRow = async () => {
  const scoresheetTable = await findScoresheetTable();
  return within(scoresheetTable).findByLabelText<HTMLTableRowElement>(
    scoresheetLeagueMatchResultRowAriaLabel,
  );
};

export const findLeagueMatchResultCell = async () => {
  const leagueMatchResultRow = await findLeagueMatchResultRow();
  return within(leagueMatchResultRow).findByLabelText<HTMLTableCellElement>(
    scoresheetLeagueMatchResultCellAriaLabel,
  );
};

export interface GameScoreTeamCells {
  homeTeamScoreCell: HTMLElement;
  awayTeamScoreCell: HTMLElement;
}

export const getGameScoreTeamCells = (
  gameScoreCell: HTMLElement,
): GameScoreTeamCells => {
  const homeTeamScoreCell = within(gameScoreCell).getByLabelText(
    getGameScoreCellTeamAriaLabel(true),
  );
  const awayTeamScoreCell = within(gameScoreCell).getByLabelText(
    getGameScoreCellTeamAriaLabel(false),
  );
  return {
    homeTeamScoreCell,
    awayTeamScoreCell,
  };
};

export const findGameWinnerAndGamesWonCell = async (
  index: number,
): Promise<HTMLTableCellElement> => {
  const firstGameRow = await findGameRow(index);
  return within(firstGameRow).getByLabelText<HTMLTableCellElement>(
    winnerAndGamesWonCellAriaLabel,
  );
};

export const getGameWinner = (
  gameWinnerAndGamesWonCell: HTMLTableCellElement,
) => {
  return within(gameWinnerAndGamesWonCell).getByLabelText(gameWinnerAriaLabel);
};

export const getGamesWon = (
  gameWinnerAndGamesWonCell: HTMLTableCellElement,
) => {
  return within(gameWinnerAndGamesWonCell).getByLabelText(gamesWonAriaLabel);
};

export const getTeamGameWon = (
  isHome: boolean,
  gameWinnerAndGamesWonCell: HTMLTableCellElement,
) => {
  const gamesWonElement = getGamesWon(gameWinnerAndGamesWonCell);
  return within(gamesWonElement).getByLabelText(
    getTeamGamesWonAriaLabel(isHome),
  );
};

export const getPlayerCell = (
  isHome: boolean,
  gameRow: HTMLTableRowElement,
) => {
  return within(gameRow).getByLabelText<HTMLTableCellElement>(
    getScoresheetGamePlayerCellAriaLabel(isHome),
  );
};

export const getTeamPlayerSpans = (cell: HTMLTableCellElement) => {
  return within(cell).getAllByLabelText(doublesPlayerAriaLabel);
};

export const getTeamMatchScore = (
  isHome: boolean,
  leagueMatchResultCell: HTMLTableCellElement,
) => {
  const teamMatchScoreElementAriaLabel =
    getLeagueMatchResultTeamElementAriaLabel(isHome);
  return within(leagueMatchResultCell).getByLabelText(
    teamMatchScoreElementAriaLabel,
  );
};

export const getAllGameScoreTeamCells = (gameRow: HTMLTableRowElement) => {
  return fillArray(5, (i) =>
    getGameScoreTeamCells(
      within(gameRow).getByLabelText(getGameScoreCellAriaLabel(i)),
    ),
  );
};

export const findAllOrderCells = async () => {
  const allGameRows = await findAllGameRows();
  return allGameRows.map((gameRow, i) => {
    return within(gameRow).getByLabelText(getMatchOrderCellAriaLabel(i));
  });
};
