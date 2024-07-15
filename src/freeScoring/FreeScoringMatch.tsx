import { MatchState, SaveState, Umpire } from "../umpire";
import { MatchInfo, PlayerNames, UmpireView } from "../umpireView";
import { usePostJson } from "./hooks/usePostJson";
import { StatsView } from "../statsViews/StatsView";
import { isMatchWon } from "../umpire/getMatchWinState";
import { getTeamInitials } from "../umpireView/helpers";
import { useRef } from "react";
import { useLoaderDataOnce } from "./hooks/useLoaderDataOnce";

export interface FreeScoringMatchData extends SaveState, PlayerNames {}

export function FreeScoringMatch() {
  const postJson = usePostJson();
  const umpireRef = useRef<Umpire | undefined>(undefined);
  const matchStateRef = useRef<MatchState | undefined>(undefined);
  /*
    When using useLoaderData and submit there are two renders.
    The first has the same data as the previous render.
    The second has the new data.
    This is a problem for my mui line chart when reach the end of the chart.
    It is possible that my usage has cause this issue.
    The alternative is to stop using actions and loaders for local storage and use a local storage hook instead. 
  */
  const component = useLoaderDataOnce<FreeScoringMatchData>(
    (freeScoringMatchState) => {
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

      const matchStateChanged = (newMatchState: MatchState) => {
        matchStateRef.current = newMatchState;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postJson(umpire.getSaveState() as any);
      };

      const matchState = matchStateRef.current ?? umpire.getMatchState();
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

      return (
        <>
          <UmpireView
            autoShowServerReceiverChooser={false}
            matchState={matchState}
            rules={rules}
            umpire={{
              pointScored(isTeam1) {
                matchStateChanged(umpire.pointScored(isTeam1));
              },
              resetServerReceiver() {
                matchStateChanged(umpire.resetServerReceiver());
              },
              setFirstGameDoublesReceiver(player) {
                matchStateChanged(umpire.setFirstGameDoublesReceiver(player));
              },
              setServer(player) {
                matchStateChanged(umpire.setServer(player));
              },
              switchEnds() {
                matchStateChanged(umpireRef.current.switchEnds());
              },
              undoPoint() {
                matchStateChanged(umpireRef.current.undoPoint());
              },
            }}
            {...playerNames}
          />
          <StatsView
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
    },
  );

  return component;
}

function getTeamLabels(playerNames: PlayerNames) {
  return {
    team1Label: getTeamInitials(
      playerNames.team1Player1Name,
      playerNames.team1Player2Name,
    ),
    team2Label: getTeamInitials(
      playerNames.team2Player1Name,
      playerNames.team2Player2Name,
    ),
  };
}
