import { screen, within } from "@testing-library/react";
import {
  getTeamMatchPlayersSelectSectionLabel,
  teamsMatchPlayersSelectSectionLabel,
} from "../src/teamMatches/teamMatchPlayerSelect";
import { roleSelectorFactory } from "../test-helpers/testing-library/selectors/roleSelectorFactory";
import {
  awayTeamSelectLabels,
  getScoresheetGameAriaLabel,
  homeTeamSelectLabels,
  scoresheetAriaLabel,
  scoresheetGameAwayPlayerAriaLabel,
  scoresheetGameHomePlayerAriaLabel,
} from "../src/teamMatches/league/LeagueMatchView";
import { from } from "../test-helpers/testing-library/from";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const findTeamsMatchPlayersSelectSection = () =>
  screen.findByRole("region", {
    name: teamsMatchPlayersSelectSectionLabel,
  });
// this also works
//screen.findByLabelText(teamsMatchPlayersSelectSectionLabel);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const teamMatchPlayersSelectSection = roleSelectorFactory(
  (isHome: boolean) => {
    return [
      "region",
      {
        name: getTeamMatchPlayersSelectSectionLabel(isHome),
      },
    ];
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const findPlayerCombo = (
  isHome: boolean,
  position: number,
  withinElement?: HTMLElement,
) => {
  const labels = isHome ? homeTeamSelectLabels : awayTeamSelectLabels;
  const label = labels[position];
  return from(withinElement).findByLabelText<HTMLInputElement>(label);
};
export const getPlayerCombo = (
  isHome: boolean,
  position: number,
  withinElement?: HTMLElement,
) => {
  const labels = isHome ? homeTeamSelectLabels : awayTeamSelectLabels;
  const label = labels[position];
  return from(withinElement).getByLabelText<HTMLInputElement>(label);
};

export const findScoresheet = () => screen.findByLabelText(scoresheetAriaLabel);
export const getScoresheetPlayer = (
  scoresheet: HTMLElement,
  isHome: boolean,
  position: number,
) => {
  const scoresheetGame = within(scoresheet).getByLabelText(
    getScoresheetGameAriaLabel(position),
  );

  const scoresheetPlayer = within(scoresheetGame).getByLabelText(
    isHome
      ? scoresheetGameHomePlayerAriaLabel
      : scoresheetGameAwayPlayerAriaLabel,
  );

  return scoresheetPlayer;
};
export const getScoresheetPlayerIdentifier = (
  scoresheet: HTMLElement,
  isHome: boolean,
  position: number,
): string => {
  return getScoresheetPlayer(scoresheet, isHome, position).innerHTML;
};
