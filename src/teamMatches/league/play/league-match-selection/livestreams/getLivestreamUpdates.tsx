import { LivestreamChanges } from "./LiveStreamingDialog";
import { Livestream } from "../../../../../firebase/rtb/team";

export const getLivestreamUpdates = (
  { free, games, tables }: LivestreamChanges,
  getNewKey: () => string,
) => {
  const updates: Record<string, Livestream | null> = {};
  const deleteLivestream = (key: string) => (updates[key] = null);
  const addLiveStream = (livestream: Livestream) =>
    (updates[getNewKey()] = livestream);
  free.deletions.forEach(deleteLivestream);
  free.additions.forEach((addition) => {
    addLiveStream(addition);
  });

  games.forEach((game) => {
    game.deletions.forEach(deleteLivestream);
    game.additions.forEach((addition) => {
      addLiveStream({
        ...addition,
        identifier: game.game,
      });
    });
  });
  tables.forEach((table) => {
    table.deletions.forEach(deleteLivestream);
    table.additions.forEach((addition) => {
      addLiveStream({
        ...addition,
        identifier: table.table,
      });
    });
  });
  return updates;
};
