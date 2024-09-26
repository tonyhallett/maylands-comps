import { AvailableDoubles } from "../player-selection/DoublesSelect";
import { MatchAndKey } from "../../db-hooks/useLeagueMatchAndMatches";
import { AvailablePlayer } from "../../db-hooks/useAvailablePlayers";
import { isNotNull } from "../../../../helpers/isNotTypeGuards";
import {
  leagueMatchFindPlayersMatchIndices,
  leagueMatchTeamsPlayersPositionDisplay,
} from "../format/singlesLeagueMatchPlayers";

type AvailablePlayerOrNull = AvailablePlayer | null;
export interface AvailablePlayersForSelection {
  selectedHomeTeamPlayers: AvailablePlayerOrNull[];
  selectedAwayTeamPlayers: AvailablePlayerOrNull[];
  homeTeamAvailablePlayers: AvailablePlayer[][];
  awayTeamAvailablePlayers: AvailablePlayer[][];
  homeAvailableDoubles: AvailableDoubles[];
  selectedHomeDoubles: AvailableDoubles | null;
  awayAvailableDoubles: AvailableDoubles[];
  selectedAwayDoubles: AvailableDoubles | null;
}

const { homeTeamPlayersPositionDisplay, awayTeamPlayersPositionDisplay } =
  leagueMatchTeamsPlayersPositionDisplay;
const { findHomePlayersMatchIndices, findAwayPlayersMatchIndices } =
  leagueMatchFindPlayersMatchIndices;

export const getAvailablePlayersForSelection = (
  matchAndKeys: MatchAndKey[],
  homeTeamAvailablePlayers: AvailablePlayer[],
  awayTeamAvailablePlayers: AvailablePlayer[],
): AvailablePlayersForSelection => {
  const getSelectedTeamPlayerIdsFromMatches = (isHome: boolean) => {
    const findPlayersMatchIndices = isHome
      ? findHomePlayersMatchIndices
      : findAwayPlayersMatchIndices;
    return findPlayersMatchIndices.map((matchIndex) => {
      const match = matchAndKeys[matchIndex].match;
      return isHome ? match.team1Player1Id : match.team2Player1Id;
    });
  };

  const getSelectedPlayers = (isHome: boolean) => {
    const teamAvailablePlayers = isHome
      ? homeTeamAvailablePlayers
      : awayTeamAvailablePlayers;
    return getSelectedTeamPlayerIdsFromMatches(isHome).map((playerId) => {
      const selectedPlayer = teamAvailablePlayers.find(
        (player) => player.playerId === playerId,
      );
      return selectedPlayer ?? null;
    });
  };

  const selectedHomeTeamPlayers = getSelectedPlayers(true);
  const actualSelectedHomeTeamPlayers =
    selectedHomeTeamPlayers.filter(isNotNull);
  const selectedAwayTeamPlayers = getSelectedPlayers(false);
  const actualSelectedAwayTeamPlayers =
    selectedAwayTeamPlayers.filter(isNotNull);
  const allActualSelectedPlayers = actualSelectedHomeTeamPlayers.concat(
    actualSelectedAwayTeamPlayers,
  );

  const getAvailablePlayers = (isHome: boolean): AvailablePlayer[][] => {
    const teamAvailablePlayers = isHome
      ? homeTeamAvailablePlayers
      : awayTeamAvailablePlayers;

    const selectedTeamPlayers = isHome
      ? selectedHomeTeamPlayers
      : selectedAwayTeamPlayers;
    //should not include players that have already been selected.
    const notSelectedTeamAvailablePlayers = teamAvailablePlayers.filter(
      (player) => {
        const playerSelected = allActualSelectedPlayers.some(
          (shtp) => shtp.playerId === player.playerId,
        );
        return !playerSelected;
      },
    );

    return selectedTeamPlayers.map((selectedPlayer) => {
      let availablePlayersForSelection = notSelectedTeamAvailablePlayers;
      if (selectedPlayer !== null) {
        availablePlayersForSelection = [
          // Each AvailablePlayer[] should include the selected
          selectedPlayer,
          ...notSelectedTeamAvailablePlayers,
        ];
      }

      return availablePlayersForSelection.sort((first, second) => {
        if (first.rank !== second.rank) {
          return first.rank - second.rank;
        }
        return first.name.localeCompare(second.name);
      });
    });
  };

  const getDoubles = (
    player1Id: string | undefined,
    player2Id: string | undefined,
    actualSelectedPlayers: AvailablePlayer[],
    isHome: boolean,
  ): {
    available: AvailableDoubles[];
    selected: AvailableDoubles | null;
  } => {
    if (actualSelectedPlayers.length < 2) {
      return {
        available: [],
        selected: null,
      };
    }
    const teamPlayersPositionDisplay = isHome
      ? homeTeamPlayersPositionDisplay
      : awayTeamPlayersPositionDisplay;
    if (actualSelectedPlayers.length === 2) {
      const available: AvailableDoubles[] = [
        {
          player1Id: actualSelectedPlayers[0].playerId,
          player1Name: actualSelectedPlayers[0].name,
          player1PositionDisplay: teamPlayersPositionDisplay[0],
          player2Id: actualSelectedPlayers[1].playerId,
          player2Name: actualSelectedPlayers[1].name,
          player2PositionDisplay: teamPlayersPositionDisplay[1],
        },
      ];
      const selected = player1Id === undefined ? null : available[0];
      return {
        available,
        selected,
      };
    }
    // could create a permute
    const pairs: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    const available = pairs.map(([p1Index, p2Index]) => {
      const availableDoubles: AvailableDoubles = {
        player1Id: actualSelectedPlayers[p1Index].playerId,
        player1Name: actualSelectedPlayers[p1Index].name,
        player1PositionDisplay: teamPlayersPositionDisplay[p1Index],
        player2Id: actualSelectedPlayers[p2Index].playerId,
        player2Name: actualSelectedPlayers[p2Index].name,
        player2PositionDisplay: teamPlayersPositionDisplay[p2Index],
      };
      return availableDoubles;
    });

    return {
      available,
      selected:
        player1Id === undefined
          ? null
          : available.find((pair) => {
              //should be able to reduce this to just the one condition
              return (
                (pair.player1Id === player1Id &&
                  pair.player2Id === player2Id) ||
                (pair.player1Id === player2Id && pair.player2Id === player1Id)
              );
            }) ?? null,
    };
  };
  const doublesMatchAndKey = matchAndKeys[matchAndKeys.length - 1];
  const doublesMatch = doublesMatchAndKey.match;

  const homeDoubles = getDoubles(
    doublesMatch.team1Player1Id,
    doublesMatch.team1Player2Id,
    actualSelectedHomeTeamPlayers,
    true,
  );
  const awayDoubles = getDoubles(
    doublesMatch.team2Player1Id,
    doublesMatch.team2Player2Id,
    actualSelectedAwayTeamPlayers,
    false,
  );

  const availablePlayersForSelection: AvailablePlayersForSelection = {
    homeTeamAvailablePlayers: getAvailablePlayers(true),
    awayTeamAvailablePlayers: getAvailablePlayers(false),
    selectedHomeTeamPlayers,
    selectedAwayTeamPlayers,
    homeAvailableDoubles: homeDoubles.available,
    selectedHomeDoubles: homeDoubles.selected,
    awayAvailableDoubles: awayDoubles.available,
    selectedAwayDoubles: awayDoubles.selected,
  };
  return availablePlayersForSelection;
};
