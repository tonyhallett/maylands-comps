import { UmpireMatchAndKey } from "./renderScoresheet-type";
import {
  TableKeyedLiveStreams,
  LivestreamAvailability,
  GameKeyedLiveStreams,
  KeyedLivestream,
} from "./livestreams/LiveStreamingDialog";
import { Livestreams } from "../../../../firebase/rtb/team";
import { getTablesAndGamesNotCompleted } from "./LeagueMatchSelection";

interface CombinedLivestreams {
  free: KeyedLivestream[];
  tables: Record<string, KeyedLivestream[]>;
  games: Record<number, KeyedLivestream[]>;
}

export function combineLiveStreams(
  livestreams: Livestreams | undefined,
): CombinedLivestreams {
  const combinedLivestreams: CombinedLivestreams = {
    free: [],
    tables: {},
    games: {},
  };
  if (livestreams) {
    Object.entries(livestreams).forEach(([key, livestream]) => {
      const keyedLivestream: KeyedLivestream = {
        key,
        ...livestream,
      };
      if (livestream.identifer) {
        const tablesOrGames =
          typeof livestream.identifer === "string" ? "tables" : "games";
        combinedLivestreams[tablesOrGames][livestream.identifer] =
          combinedLivestreams[tablesOrGames][livestream.identifer] ?? [];
        combinedLivestreams[tablesOrGames][livestream.identifer].push(
          keyedLivestream,
        );
      } else {
        combinedLivestreams.free.push(keyedLivestream);
      }
    });
  }

  return combinedLivestreams;
}

export function getLiveStreamAvailability(
  livestreams: Livestreams | undefined,
  umpireMatchAndKeys: UmpireMatchAndKey[],
): LivestreamAvailability {
  const { tables, games } = getTablesAndGamesNotCompleted(umpireMatchAndKeys);
  const liveStreamAvailability: LivestreamAvailability = {
    free: [],
    tables: [],
    games: [],
  };
  const combinedLivestreams = combineLiveStreams(livestreams);
  liveStreamAvailability.free = combinedLivestreams.free;
  tables.forEach((tableId) => {
    const tableDisplayKeyedLiveStreams: TableKeyedLiveStreams = {
      table: tableId,
      streams: combinedLivestreams.tables[tableId] ?? [],
    };
    liveStreamAvailability.tables.push(tableDisplayKeyedLiveStreams);
  });
  games.forEach((gameIndex) => {
    const gameDisplayKeyedLiveStreams: GameKeyedLiveStreams = {
      game: gameIndex,
      streams: combinedLivestreams.games[gameIndex] ?? [],
    };
    liveStreamAvailability.games.push(gameDisplayKeyedLiveStreams);
  });

  return liveStreamAvailability;
}
