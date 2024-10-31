import {
  TableKeyedLiveStreams,
  LivestreamAvailability,
  MatchKeyedLiveStreams,
  KeyedLivestream,
} from "./LiveStreamingDialog";
import { Livestreams } from "../../../../../firebase/rtb/team";
import { TablesAndMatchesNotCompleted } from "../getTablesAndMatchesNotCompleted";
import { ExtractKey } from "../../../../../firebase/rtb/typeHelpers";

interface CombinedLivestreams {
  free: KeyedLivestream[];
  tables: Record<string, KeyedLivestream[]>;
  matches: Record<number, KeyedLivestream[]>;
}

type TablesOrMatchesKey = ExtractKey<CombinedLivestreams, "tables" | "matches">;
export function combineLiveStreams(
  livestreams: Livestreams | undefined,
): CombinedLivestreams {
  const combinedLivestreams: CombinedLivestreams = {
    free: [],
    tables: {},
    matches: {},
  };
  if (livestreams) {
    Object.entries(livestreams).forEach(([key, livestream]) => {
      const keyedLivestream: KeyedLivestream = {
        key,
        ...livestream,
      };
      if (livestream.identifier !== undefined) {
        const tablesOrMatchesKey: TablesOrMatchesKey =
          typeof livestream.identifier === "string" ? "tables" : "matches";
        combinedLivestreams[tablesOrMatchesKey][livestream.identifier] =
          combinedLivestreams[tablesOrMatchesKey][livestream.identifier] ?? [];
        combinedLivestreams[tablesOrMatchesKey][livestream.identifier].push(
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
    matches: [],
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
    const matchDisplayKeyedLiveStreams: MatchKeyedLiveStreams = {
      game: match.number,
      streams: combinedLivestreams.matches[match.number] ?? [],
    };
    liveStreamAvailability.matches.push(matchDisplayKeyedLiveStreams);
  });

  return liveStreamAvailability;
}
