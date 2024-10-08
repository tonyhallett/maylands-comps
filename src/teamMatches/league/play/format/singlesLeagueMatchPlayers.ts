import { PlayerMatchIndicesAndPositionDisplay } from "../../player-match-indices-display";
import { getMatchPlayersPositionDisplay } from "../../player-match-indices-display/getMatchPlayersPositionDisplay";
import { getNumMatches } from "../../player-match-indices-display/getNumMatches";
import { getTeamsFindPlayersMatchIndices } from "../../player-match-indices-display/getTeamsFindPlayersMatchIndices";
import { getTeamsPlayersPositionDisplay } from "../../player-match-indices-display/getTeamsPlayersPositionDisplay";

export const homePlayersMatchIndicesAndDisplay: PlayerMatchIndicesAndPositionDisplay[] =
  [
    { matchIndices: [0, 4, 8], positionDisplay: "A" },
    { matchIndices: [1, 3, 6], positionDisplay: "B" },
    { matchIndices: [2, 5, 7], positionDisplay: "C" },
  ];
export const awayPlayersMatchIndicesAndDisplay: PlayerMatchIndicesAndPositionDisplay[] =
  [
    { matchIndices: [0, 3, 7], positionDisplay: "X" },
    { matchIndices: [1, 5, 8], positionDisplay: "Y" },
    { matchIndices: [2, 4, 6], positionDisplay: "Z" },
  ];

export const leagueMatchPlayersPositionDisplays =
  getMatchPlayersPositionDisplay(
    homePlayersMatchIndicesAndDisplay,
    awayPlayersMatchIndicesAndDisplay,
  );

export const leagueMatchTeamsPlayersPositionDisplay =
  getTeamsPlayersPositionDisplay(
    homePlayersMatchIndicesAndDisplay,
    awayPlayersMatchIndicesAndDisplay,
  );

export const leagueMatchFindPlayersMatchIndices =
  getTeamsFindPlayersMatchIndices(
    homePlayersMatchIndicesAndDisplay,
    awayPlayersMatchIndicesAndDisplay,
  );

export const leagueMatchNumberOfSingles = getNumMatches(
  homePlayersMatchIndicesAndDisplay,
);
