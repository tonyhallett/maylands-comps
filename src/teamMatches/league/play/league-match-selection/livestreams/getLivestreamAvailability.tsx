import {
  TableKeyedLiveStreams,
  LivestreamAvailability,
  GameKeyedLiveStreams,
  KeyedLivestream,
} from "./LiveStreamingDialog";
import { Livestreams } from "../../../../../firebase/rtb/team";
import { TablesAndMatchesNotCompleted } from "../getTablesAndMatchesNotCompleted";

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
      if (livestream.identifier !== undefined) {
        const tablesOrGames =
          typeof livestream.identifier === "string" ? "tables" : "games";
        combinedLivestreams[tablesOrGames][livestream.identifier] =
          combinedLivestreams[tablesOrGames][livestream.identifier] ?? [];
        combinedLivestreams[tablesOrGames][livestream.identifier].push(
          keyedLivestream,
        );
      } else {
        combinedLivestreams.free.push(keyedLivestream);
      }
    });
  }

  return combinedLivestreams;
}

export function getLivestreamAvailability(
  livestreams: Livestreams | undefined,
  tablesAndGamesNotCompleted: TablesAndMatchesNotCompleted,
): LivestreamAvailability {
  const { tables, matches } = tablesAndGamesNotCompleted;
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
  matches.forEach((match) => {
    const gameDisplayKeyedLiveStreams: GameKeyedLiveStreams = {
      game: match.number,
      streams: combinedLivestreams.games[match.number] ?? [],
    };
    liveStreamAvailability.games.push(gameDisplayKeyedLiveStreams);
  });

  return liveStreamAvailability;
}
