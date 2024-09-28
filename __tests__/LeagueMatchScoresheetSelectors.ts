import { within } from "@testing-library/react";
import { findScoresheetSection } from "./leagueMatchViewSelectors";
import {
  getScoresheetGameRowAriaLabel,
  scoresheetLeagueMatchResultsRowAriaLabel,
  scoresheetTableAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/LeagueMatchView";
import { fillArray } from "../src/helpers/fillArray";

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

export const findFirstGameRow = async () => {
  const scoresheetTable = await findScoresheetTable();
  return findGameRowWithin(scoresheetTable, 0);
};

export const findLeagueMatchResultRow = async () => {
  const scoresheetTable = await findScoresheetTable();
  within(scoresheetTable).findByLabelText<HTMLTableRowElement>(
    scoresheetLeagueMatchResultsRowAriaLabel,
  );
};
