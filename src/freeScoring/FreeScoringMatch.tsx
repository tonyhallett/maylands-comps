import { SaveState, Umpire } from "../umpire";
import {
  PlayerNames,
  UmpireController,
  UmpireMatchStateRenderer,
} from "../umpireView/UmpireController";
import { useRef } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { usePostJson } from "./hooks/usePostJson";
import { HistoryView } from "../umpireView/history/HistoryView";
import { isMatchWon } from "../umpire/getMatchWinState";
import { getTeamVs } from "../umpireView/helpers";

export interface FreeScoringMatchData extends SaveState, PlayerNames {}

export function FreeScoringMatch() {
  const umpireControllerRef = useRef<JSX.Element | undefined>();
  const matchState = useLoaderDataT<FreeScoringMatchData>();
  const postJson = usePostJson();
  const {
    team1Player1Name,
    team1Player2Name,
    team2Player1Name,
    team2Player2Name,
    ...saveState
  } = matchState;

  if (umpireControllerRef.current === undefined) {
    const theUmpire = new Umpire(saveState);
    umpireControllerRef.current = (
      <UmpireController
        additionalStateRendering={statsRenderer}
        matchStateChanged={() => {
          const saveState = theUmpire.getSaveState();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postJson(saveState as any);
        }}
        umpire={theUmpire}
        team1Player1Name={team1Player1Name}
        team2Player1Name={team2Player1Name}
        team1Player2Name={team1Player2Name}
        team2Player2Name={team2Player2Name}
      />
    );
  }
  return umpireControllerRef.current;
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
