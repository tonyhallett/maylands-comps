import { Umpire } from "../umpire";
import {
  PlayerNames,
  UmpireController,
  UmpireMatchStateRenderer,
} from "../umpireView/UmpireController";
import { useRef } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import {
  FreeScoringMatchSaveState,
  FreeScoringMatchState,
} from "./FreeScoringMatches";
import { usePostJson } from "./hooks/usePostJson";
import { HistoryView } from "../umpireView/history/HistoryView";
import { isMatchWon } from "../umpire/getMatchWinState";
import { getTeamVs } from "../umpireView/helpers";
interface UmpireControllerRef {
  umpireController: JSX.Element;
  id: string;
}
export function FreeScoringMatch() {
  const umpireControllerRef = useRef<UmpireControllerRef | undefined>();
  const matchState = useLoaderDataT<FreeScoringMatchState>();
  const postJson = usePostJson();
  const {
    // to consider https://eslint.org/docs/rules/no-unused-vars#ignorerestsiblings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastUsed,
    team1Player1Name,
    team1Player2Name,
    team2Player1Name,
    team2Player2Name,
    team1Player1Id,
    team1Player2Id,
    team2Player1Id,
    team2Player2Id,
    umpire,
    title,
    ...saveState
  } = matchState;

  if (
    umpireControllerRef.current === undefined ||
    umpireControllerRef.current.id !== id
  ) {
    const theUmpire = new Umpire(saveState);
    umpireControllerRef.current = {
      id,
      umpireController: (
        <UmpireController
          additionalStateRendering={statsRenderer}
          matchStateChanged={() => {
            const saveState = theUmpire.getSaveState();
            const updatedMatchState: FreeScoringMatchSaveState = {
              id,
              team1Player1Id,
              team1Player2Id,
              team2Player1Id,
              team2Player2Id,
              umpire,
              title,
              ...saveState,
              lastUsed: new Date().getTime(),
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            postJson(updatedMatchState as any);
          }}
          umpire={theUmpire}
          team1Player1Name={team1Player1Name}
          team2Player1Name={team2Player1Name}
          team1Player2Name={team1Player2Name}
          team2Player2Name={team2Player2Name}
        />
      ),
    };
  }
  return umpireControllerRef.current.umpireController;
}

function getTeamLabels(playerNames: PlayerNames) {
  return {
    team1Label: getTeamVs(
      playerNames.team1Player1Name,
      playerNames.team1Player2Name,
    ),
    team2Label: getTeamVs(
      playerNames.team2Player1Name,
      playerNames.team2Player2Name,
    ),
  };
}
const statsRenderer: UmpireMatchStateRenderer = (
  matchState,
  umpire,
  playerNames,
) => {
  return (
    <HistoryView
      upTo={umpire.upTo}
      gamePoint={umpire.upTo - 1}
      team1StartScore={umpire.team1StartGameScore}
      team2StartScore={umpire.team2StartGameScore}
      matchWon={isMatchWon(matchState.matchWinState)}
      currentGameScore={{
        team1Points: matchState.team1Score.points,
        team2Points: matchState.team2Score.points,
      }}
      team1Left={matchState.team1Left}
      gameScores={matchState.gameScores}
      pointHistory={matchState.pointHistory}
      {...getTeamLabels(playerNames)}
    />
  );
};
