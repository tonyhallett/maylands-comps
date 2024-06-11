import { Player } from "../umpire";
import { PlayerAndName } from "./mapNames";

export function PlayerChooser({
  playerAndNames,
  callback,
  title,
}: {
  playerAndNames: PlayerAndName[];
  callback: (player: Player) => void;
  title: string;
}) {
  return (
    <div>
      <span>{title}</span>
      <span> </span>
      {playerAndNames.map((playerAndName) => (
        <button
          key={playerAndName.player}
          onClick={() => callback(playerAndName.player)}
        >
          {playerAndName.name}
        </button>
      ))}
    </div>
  );
}
