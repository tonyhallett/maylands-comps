import { Player } from ".";
import { Team, getDoublesOpponents } from "./playersHelpers";

export interface InitialServersDoublesReceiver {
  gameInitialServers: Player[];
  firstDoublesReceiver: Player | undefined; // as sufficient to determine the service cycle
}
type EmptyArray<T> = T[] & { length: 0 };

export interface ServerReceiverChoice {
  servers: Player[];
  firstGameDoublesReceivers: Team | EmptyArray<Player>;
}

export const availableServerReceiverChoice = (
  isDoubles: boolean,
  initialServersReceiver: InitialServersDoublesReceiver,
  gameNumber: number,
): ServerReceiverChoice => {
  const choice: ServerReceiverChoice = {
    firstGameDoublesReceivers: [],
    servers: [],
  };
  if (isDoubles) {
    // first game
    if (initialServersReceiver.gameInitialServers.length === 0) {
      choice.servers = [
        "Team1Player1",
        "Team1Player2",
        "Team2Player1",
        "Team2Player2",
      ];
      choice.firstGameDoublesReceivers = [];
    } else {
      if (gameNumber === 1) {
        choice.firstGameDoublesReceivers =
          initialServersReceiver.firstDoublesReceiver === undefined
            ? getDoublesOpponents(initialServersReceiver.gameInitialServers[0])
            : [];
      } else {
        const initialServerForGame =
          initialServersReceiver.gameInitialServers[gameNumber - 1];
        if (initialServerForGame === undefined) {
          const initialServerFromPreviousGame =
            initialServersReceiver.gameInitialServers[gameNumber - 2];
          choice.servers = getDoublesOpponents(initialServerFromPreviousGame);
        }
      }
    }
  } else {
    if (initialServersReceiver.gameInitialServers.length === 0) {
      choice.servers = ["Team1Player1", "Team2Player1"];
    }
  }
  return choice;
};
