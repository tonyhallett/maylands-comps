import { screen, within } from "@testing-library/react";
import { matchPlayersSelectSectionLabel } from "../src/teamMatches/league/play/player-selection/TeamMatchPlayerSelect";

import { from } from "../test-helpers/testing-library/from";
import { getDoublesSelectAriaLabel } from "../src/teamMatches/league/play/player-selection/DoublesSelect";
import {
  clearOptions,
  openAutocompleteAndGetOptions,
} from "../test-helpers/mui/autocomplete";
import { scoresheetSectionAriaLabel } from "../src/teamMatches/league/play/league-match-selection/LeagueMatchSelection";
import {
  awayTeamSelectLabels,
  homeTeamSelectLabels,
} from "../src/teamMatches/league/play/league-match-selection/team-select-labels";

import {
  getTeamSelectPlayersAndDoublesAriaLabel,
  teamsSelectionAriaLabel,
} from "../src/teamMatches/league/play/player-selection/TeamsSelectPlayersAndDoubles";

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

export const findScoresheetSection = () =>
  screen.findByLabelText(scoresheetSectionAriaLabel);

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
