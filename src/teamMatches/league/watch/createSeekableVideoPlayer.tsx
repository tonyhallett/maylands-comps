import { useEffect, useState } from "react";
import { LivestreamPlayerInfo } from "../../../firebase/rtb/team";
import { KeyedLivestream } from "../play/league-match-selection/livestreams/LiveStreamingDialog";
import {
  LivestreamProvider,
  Moment,
  SeekCallback,
  SeekFunctions,
} from "../play/league-match-selection/livestreams/LivestreamProvider";
import { getLivestreamProvider } from "../play/league-match-selection/livestreams/providers/livestreamProviders";
import { GameSeekPoints, MatchSeekPoints, SeekPoint, Seeker } from "./Seeker";
import { PossibleMatchPoints } from "./WatchLeagueMatch";

interface SeekableVideoPlayerProps {
  livestreamPlayerInfo: LivestreamPlayerInfo;
  livestreamProvider: LivestreamProvider;
  matchesPossiblePoints: PossibleMatchPoints[];
  singleMatch: boolean;
}

interface MatchMoment extends Moment {
  pointIndex: number;
  gameIndex: number;
  matchIndex: number;
}

export function SeekableVideoPlayer({
  livestreamProvider,
  livestreamPlayerInfo,
  matchesPossiblePoints,
  singleMatch,
}: SeekableVideoPlayerProps) {
  const [seekPoints, setSeekPoints] = useState<MatchSeekPoints | undefined>(
    undefined,
  );

  const [seekFunctions, setSeekFunctions] = useState<
    SeekFunctions<MatchMoment> | undefined
  >(undefined);

  useEffect(() => {
    if (seekFunctions !== undefined) {
      const moments: MatchMoment[] = matchesPossiblePoints.flatMap(
        (possibleMatchPoints, matchIndex) => {
          return possibleMatchPoints.gamesPointHistory.flatMap(
            (gamePointHistory, gameIndex) => {
              return gamePointHistory.map((pointHistory, pointIndex) => {
                const matchMoment = {
                  date: pointHistory.date,
                  pointIndex: pointIndex,
                  gameIndex: gameIndex,
                  matchIndex: matchIndex,
                };
                return matchMoment;
              });
            },
          );
        },
      );
      const seekPoints = seekFunctions
        .getSeekableMoments(moments)
        .reduce<MatchSeekPoints>((acc, moment) => {
          const match = matchesPossiblePoints[moment.matchIndex];
          const game = match.gamesPointHistory[moment.gameIndex];
          const point = game[moment.pointIndex];
          if (!acc.has(match.match)) {
            acc.set(match.match, new Map<number, SeekPoint[]>());
          }
          // should reorder ?
          const gameSeekPoints = acc.get(match.match)!;
          if (!gameSeekPoints.has(moment.gameIndex)) {
            gameSeekPoints.set(moment.gameIndex, []);
          }
          gameSeekPoints.get(moment.gameIndex)!.push({
            date: moment.date,
            gameScoreState: {
              team1Points: point.team1Points,
              team2Points: point.team2Points,
              pointState: point.pointState,
              team1WonPoint: point.team1WonPoint,
            },
          });
          return acc;
        }, new Map<string, GameSeekPoints>());
      setSeekPoints(seekPoints);
    }
  }, [matchesPossiblePoints, seekFunctions]);

  const seekCallback: SeekCallback<MatchMoment> = (seekFunctions) => {
    setSeekFunctions(seekFunctions);
  };
  const player = livestreamProvider.getPlayer(
    livestreamPlayerInfo,
    seekCallback,
  );

  return (
    <div>
      {player}
      {livestreamProvider.canSeek &&
        seekPoints !== undefined &&
        seekFunctions !== undefined &&
        seekPoints.size > 0 && (
          <Seeker
            singleMatch={singleMatch}
            matchSeekPoints={seekPoints}
            seek={seekFunctions.seek}
            identifying={livestreamPlayerInfo.url}
          />
        )}
    </div>
  );
}

export function createSeekableVideoPlayer(
  keyedLivestream: KeyedLivestream,
  matchesPossiblePoints: PossibleMatchPoints[],
  singleMatch = false,
) {
  const livestreamProvider = getLivestreamProvider(keyedLivestream.service);

  const playerInfo: LivestreamPlayerInfo = {
    url: keyedLivestream.url,
  };
  if (keyedLivestream.playerProp !== undefined) {
    playerInfo.playerProp = keyedLivestream.playerProp;
  }

  return (
    <SeekableVideoPlayer
      livestreamProvider={livestreamProvider}
      livestreamPlayerInfo={playerInfo}
      matchesPossiblePoints={matchesPossiblePoints}
      singleMatch={singleMatch}
    />
  );
}
