import { SaveState, Umpire } from "../umpire";
import {
  MatchInfo,
  PlayerNames,
  UmpireController,
} from "../umpireView/UmpireController";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { usePostJson } from "./hooks/usePostJson";
import { HistoryView } from "../umpireView/history/HistoryView";
import { isMatchWon } from "../umpire/getMatchWinState";
import { getTeamVs } from "../umpireView/helpers";
import { useRef } from "react";

export interface FreeScoringMatchData extends SaveState, PlayerNames {}

export function FreeScoringMatch() {
  const lastRenderRef = useRef<JSX.Element | undefined>(undefined);
  const umpireRef = useRef<Umpire | undefined>(undefined);
  const lastLoaderData = useRef<FreeScoringMatchData | undefined>(undefined);
  const freeScoringMatchState = useLoaderDataT<FreeScoringMatchData>();
  let sameData = false;
  if (lastLoaderData.current !== undefined) {
    sameData = lastLoaderData.current === freeScoringMatchState;
  }
  lastLoaderData.current = freeScoringMatchState;
  const postJson = usePostJson();
  const {
    team1Player1Name,
    team1Player2Name,
    team2Player1Name,
    team2Player2Name,
    ...saveState
  } = freeScoringMatchState;

  if (umpireRef.current === undefined) {
    umpireRef.current = new Umpire(saveState);
  }
  const umpire = umpireRef.current;

  const matchStateChanged = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postJson(umpire.getSaveState() as any);
  };
  if (sameData) {
    return lastRenderRef.current;
  }
  const matchState = umpire.getMatchState();
  const rules: MatchInfo = {
    bestOf: umpire.bestOf,
    upTo: umpire.upTo,
    clearBy2: umpire.clearBy2,
    numServes: umpire.numServes,
    team1EndsAt: umpire.team1MidwayPoints,
    team2EndsAt: umpire.team2MidwayPoints,
  };
  const playerNames: PlayerNames = {
    team1Player1Name,
    team1Player2Name,
    team2Player1Name,
    team2Player2Name,
  };

  const component = (
    <>
      <UmpireController
        matchState={matchState}
        rules={rules}
        umpire={{
          pointScored(isTeam1) {
            umpire.pointScored(isTeam1);
            matchStateChanged();
          },
          resetServerReceiver() {
            umpire.resetServerReceiver();
            matchStateChanged();
          },
          setFirstGameDoublesReceiver(player) {
            umpire.setFirstGameDoublesReceiver(player);
            matchStateChanged();
          },
          setServer(player) {
            umpire.setServer(player);
            matchStateChanged();
          },
          switchEnds() {
            umpireRef.current.switchEnds();
            matchStateChanged();
          },
          undoPoint() {
            umpireRef.current.undoPoint();
            matchStateChanged();
          },
        }}
        {...playerNames}
      />
      <HistoryView
        upTo={rules.upTo}
        gamePoint={rules.upTo - 1}
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
    </>
  );

  lastRenderRef.current = component;
  return component;
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
