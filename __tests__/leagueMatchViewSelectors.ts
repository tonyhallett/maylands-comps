import { screen, within } from "@testing-library/react";
import { matchPlayersSelectSectionLabel } from "../src/teamMatches/teamMatchPlayerSelect";

import { from } from "../test-helpers/testing-library/from";
import { getDoublesSelectAriaLabel } from "../src/teamMatches/league/DoublesSelect";
import {
  clearOptions,
  openAutocompleteAndGetOptions,
} from "../test-helpers/mui/autocomplete";
import {
  awayTeamSelectLabels,
  homeTeamSelectLabels,
  scoresheetAriaLabel,
} from "../src/teamMatches/league/LeagueMatchSelection";
import { getScoresheetGameAriaLabel } from "../src/teamMatches/league/LeagueMatchView";
import {
  scoresheetGameAwayPlayerAriaLabel,
  scoresheetGameHomePlayerAriaLabel,
} from "../src/teamMatches/league/getPlayerCell";
import {
  getTeamSelectPlayersAndDoublesAriaLabel,
  teamsSelectionAriaLabel,
} from "../src/teamMatches/league/TeamsSelectPlayersAndDoubles";

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

export const findTeamsSelectionSection = () => {
  return screen.findByRole("region", {
    name: teamsSelectionAriaLabel,
  });
};

export const getTeamSelectionSectionWithin = (
  teamsSelectionSection: HTMLElement,
  isHome: boolean,
) => {
  return within(teamsSelectionSection).getByRole("region", {
    name: getTeamSelectPlayersAndDoublesAriaLabel(isHome),
  });
};

export const getTeamPlayerComboInputs = (
  teamsSelectionSection: HTMLElement,
  isHome: boolean,
) => {
  const teamSelectionSection = getTeamSelectionSectionWithin(
    teamsSelectionSection,
    isHome,
  );
  const teamMatchPlayersSelectSection = within(teamSelectionSection).getByRole(
    "region",
    { name: matchPlayersSelectSectionLabel },
  );
  return within(teamMatchPlayersSelectSection).getAllByRole<HTMLInputElement>(
    "combobox",
  );
};

export async function getPlayerComboInputs() {
  const teamsSelectionSection = await findTeamsSelectionSection();
  return {
    homePlayerInputs: getTeamPlayerComboInputs(teamsSelectionSection, true),
    awayPlayerInputs: getTeamPlayerComboInputs(teamsSelectionSection, false),
  };
}

export async function findDoublesCombo(isHome): Promise<HTMLInputElement> {
  return screen.findByLabelText(getDoublesSelectAriaLabel(isHome));
}

export async function openPlayerAutocompleteAndGetOptions(
  isHome: boolean,
  position: number,
) {
  const playerCombo = await findPlayerCombo(isHome, position);
  const options = openAutocompleteAndGetOptions(playerCombo).map(
    (htmlOption) => htmlOption.innerHTML,
  );
  clearOptions(playerCombo);
  return options;
}
