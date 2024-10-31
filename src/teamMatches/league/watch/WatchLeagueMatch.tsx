import { Fragment } from "react";
import CenteredCircularProgress from "../../../helper-components/CenteredCircularProgress";
import { GamesPointHistory } from "../../../umpire";
import { MatchStateView } from "../../../umpireView/MatchStateView";
import { useLeagueMatchAndMatches } from "../db-hooks/useLeagueMatchAndMatches";
import { leagueMatchNumberOfSingles } from "../play/format/singlesLeagueMatchPlayers";
import { addUmpireToMatchAndKeys } from "../play/league-match-selection/addUmpireToMatchAndKeys";
import { mainTable } from "../play/league-match-selection/getTablesAndMatchesNotCompleted";
import { combineLiveStreams } from "../play/league-match-selection/livestreams/getLivestreamAvailability";
import { Box } from "@mui/material";
import { createSeekableVideoPlayer } from "./createSeekableVideoPlayer";

export interface PossibleMatchPoints {
  match: string;
  gamesPointHistory: GamesPointHistory;
}
interface PossibleMatchPointsInfo extends PossibleMatchPoints {
  tableId: string;
}

export function WatchLeagueMatch({ leagueMatchId }: { leagueMatchId: string }) {
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(leagueMatchId!);

  if (
    leagueMatch === undefined ||
    matchAndKeys.length !== leagueMatchNumberOfSingles + 1
  ) {
    return <CenteredCircularProgress />;
  }
  const umpireMatchAndKeys = addUmpireToMatchAndKeys(matchAndKeys);
  const possibleMatchPointsInfos = umpireMatchAndKeys.map(
    (umpireMatchAndKey, i) => {
      const matchState = umpireMatchAndKey.matchState;
      const pointHistory = matchState.pointHistory;
      const tableId = umpireMatchAndKey.match.tableId;
      const possibleMatchPointsInfo: PossibleMatchPointsInfo = {
        match: (i + 1).toString(), //todo
        gamesPointHistory: pointHistory,
        tableId: tableId ?? mainTable,
      };
      return possibleMatchPointsInfo;
    },
  );
  // need player names
  const liveStreams = combineLiveStreams(leagueMatch.livestreams);
  const freeLiveStreamVideos = liveStreams.free.map((freeStream) => {
    return (
      <Fragment key={freeStream.key}>
        {createSeekableVideoPlayer(freeStream, possibleMatchPointsInfos)}
      </Fragment>
    );
  });

  const tableLiveStreamVideos = Object.entries(liveStreams.tables).map(
    ([table, keyedLivestreams]) => {
      return (
        <div key={table}>
          <div>{table}</div>
          {keyedLivestreams.map((keyedLivestream) => {
            return (
              <Fragment key={keyedLivestream.key}>
                {createSeekableVideoPlayer(
                  keyedLivestream,
                  possibleMatchPointsInfos.filter((possibleMatchPointsInfo) => {
                    return possibleMatchPointsInfo.tableId === table;
                  }),
                )}
              </Fragment>
            );
          })}
        </div>
      );
    },
  );

  const matchVideos = umpireMatchAndKeys.map((umpireMatchAndKey, i) => {
    const matchState = umpireMatchAndKey.matchState;
    const matchLivestreams = (liveStreams.matches[i] =
      liveStreams.matches[i] ?? []);
    return (
      <div key={umpireMatchAndKey.key}>
        {matchLivestreams.map((keyedLivestream) => {
          return createSeekableVideoPlayer(
            keyedLivestream,
            [possibleMatchPointsInfos[i]],
            true,
          );
        })}
        <MatchStateView
          matchState={matchState}
          serverReceiverTop
          team1Player1Name="Joe Bloggs"
          team2Player1Name="A Nother"
          team1Player2Name={undefined}
          team2Player2Name={undefined}
        />
      </div>
    );
  });
  return (
    <Box m={1}>
      {freeLiveStreamVideos}
      {tableLiveStreamVideos}
      {matchVideos}
    </Box>
  );
}
