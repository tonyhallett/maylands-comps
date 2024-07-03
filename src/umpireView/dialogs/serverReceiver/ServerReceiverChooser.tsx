import { Player } from "../../../umpire";
import { PlayerNames } from "../../UmpireController";
import { mapNames } from "./mapNames";
import { PlayerChooserDialog } from "./PlayerChooserDialog";

export interface ServersReceiversChooserProps extends PlayerNames {
  availableServers: readonly Player[];
  availableReceivers: readonly Player[];
  showTosser: boolean;
  chosenCallback: (player: Player, isServer: boolean) => void;
}

export function ServerReceiverChooser({
  availableReceivers,
  availableServers,
  chosenCallback,
  showTosser,
  ...playerNames
}: ServersReceiversChooserProps) {
  if (availableServers.length > 0) {
    return (
      <PlayerChooserDialog
        showTosser={showTosser}
        title="Choose server"
        playerAndNames={mapNames(availableServers, playerNames)}
        callback={(player) => chosenCallback(player, true)}
      />
    );
  }
  if (availableReceivers.length > 0) {
    return (
      <PlayerChooserDialog
        showTosser={showTosser}
        title="Choose receiver"
        playerAndNames={mapNames(availableReceivers, playerNames)}
        callback={(player) => chosenCallback(player, false)}
      />
    );
  }
  return undefined;
}
