import { Database } from "firebase/database";
import { useState } from "react";
import {
  awayPlayersMatchIndicesAndDisplay,
  homePlayersMatchIndicesAndDisplay,
  leagueMatchPlayersPositionDisplays,
} from "../format/singlesLeagueMatchPlayers";
import { MatchAndKey } from "../../db-hooks/useLeagueMatchAndMatches";
import { Dialog } from "@mui/material";
import { updateForfeited } from "../../../../firebase/rtb/match/db-helpers/updateForfeited";
import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";

export enum ForfeitActionType {
  forfeit,
  undoForfeit,
}

export interface GameForfeitModel {
  forfeitActionType: ForfeitActionType;
  act: () => void;
}

export interface SinglesGameForfeitModel extends GameForfeitModel {
  identifier: string;
}

export interface TeamForfeitModel {
  singles: SinglesGameForfeitModel[];
  doubles?: GameForfeitModel;
}

export interface ForfeitModel {
  home: TeamForfeitModel;
  away: TeamForfeitModel;
}

export function useForfeit(
  matchAndKeys: MatchAndKey[],

  getDialogContents: (forfeitModel: ForfeitModel) => React.ReactNode,
  db: Database,
) {
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);
  const ready = matchAndKeys.length === 10;
  const getDisabled = () => {
    // should be disabled if all players are selected
    let allPlayersSelected = true;
    for (let i = 0; i < 3; i++) {
      const match = matchAndKeys[i].match;
      allPlayersSelected =
        match.team1Player1Id !== undefined &&
        match.team2Player1Id !== undefined;
      if (!allPlayersSelected) {
        break;
      }
    }
    if (allPlayersSelected) {
      const doublesMatch = matchAndKeys[9].match;
      allPlayersSelected =
        doublesMatch.team1Player1Id !== undefined &&
        doublesMatch.team1Player2Id !== undefined &&
        doublesMatch.team2Player1Id !== undefined &&
        doublesMatch.team2Player2Id !== undefined;
    }

    return allPlayersSelected;
  };
  const getFofeitModel = () => {
    const forfeitModel: ForfeitModel = {
      home: {
        singles: [],
      },
      away: {
        singles: [],
      },
    };
    const addIfPlayerUndefined = (
      match: DbMatch,
      isHome: boolean,
      matchIndex: number,
      getIdentifier?: (isHome: boolean, matchIndex: number) => string,
    ) => {
      const playerKey = isHome ? "team1Player1Id" : "team2Player1Id"; //todo type these keys
      if (match[playerKey] === undefined) {
        const teamConcedeOrDefault = isHome
          ? match.team1ConcedeOrForfeit
          : match.team2ConcedeOrForfeit;
        const forfeitActionType =
          teamConcedeOrDefault !== undefined
            ? ForfeitActionType.undoForfeit
            : ForfeitActionType.forfeit;
        const gameForfeitModel: GameForfeitModel = {
          forfeitActionType,
          act: () => {
            let allMatches: number[];
            if (getIdentifier !== undefined) {
              const { homePositionDisplay, awayPositionDisplay } =
                leagueMatchPlayersPositionDisplays[matchIndex];
              const positionDisplay = isHome
                ? homePositionDisplay
                : awayPositionDisplay;
              const position = positionDisplay.position;
              const playersMatchIndicesAndDisplay = isHome
                ? homePlayersMatchIndicesAndDisplay
                : awayPlayersMatchIndicesAndDisplay;
              allMatches = playersMatchIndicesAndDisplay[position].matchIndices;
            } else {
              allMatches = [matchIndex];
            }

            updateForfeited(
              allMatches.map((matchIndex) => matchAndKeys[matchIndex].key),
              forfeitActionType === ForfeitActionType.forfeit,
              isHome,
              db,
            );

            setShowForfeitDialog(false);
          },
        };
        const teamForfeitModel = forfeitModel[isHome ? "home" : "away"];
        if (getIdentifier) {
          teamForfeitModel.singles.push({
            identifier: getIdentifier(isHome, matchIndex),
            ...gameForfeitModel,
          });
        } else {
          teamForfeitModel.doubles = gameForfeitModel;
        }
      }
    };
    const addIfSinglesPlayerUndefined = (
      match: DbMatch,
      isHome: boolean,
      matchIndex: number,
    ) => {
      addIfPlayerUndefined(match, isHome, matchIndex, (isHome, matchIndex) => {
        const playersMatchIndicesAndDisplay = isHome
          ? homePlayersMatchIndicesAndDisplay
          : awayPlayersMatchIndicesAndDisplay;
        return playersMatchIndicesAndDisplay[matchIndex].positionDisplay;
      });
    };
    for (let i = 0; i < 3; i++) {
      const match = matchAndKeys[i].match;
      addIfSinglesPlayerUndefined(match, true, i);
      addIfSinglesPlayerUndefined(match, false, i);
    }
    const doublesMatch = matchAndKeys[9].match;
    const addDoublesIfPlayerUndefined = (match: DbMatch, isHome: boolean) => {
      addIfPlayerUndefined(match, isHome, 9, undefined);
    };
    addDoublesIfPlayerUndefined(doublesMatch, true);
    addDoublesIfPlayerUndefined(doublesMatch, false);

    return forfeitModel;
  };
  const showForfeitDialogDisabled = ready ? getDisabled() : true;
  const openForfeitDialog = () => {
    if (!showForfeitDialogDisabled) {
      setShowForfeitDialog(true);
    }
  };
  const forfeitModel = ready ? getFofeitModel() : undefined;
  const getForfeitDialog = () => {
    if (!forfeitModel) {
      return null;
    }
    return (
      <Dialog
        onClose={() => setShowForfeitDialog(false)}
        open={showForfeitDialog}
      >
        {getDialogContents(forfeitModel)}
      </Dialog>
    );
  };

  return {
    showForfeitDialogDisabled,
    openForfeitDialog,
    getForfeitDialog,
    forfeitModel,
  };
}
