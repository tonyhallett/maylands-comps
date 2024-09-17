import { getLast, isEven } from "./helpers";
import { ServerReceiver } from "./commonTypes";
import { Player } from ".";
import { InitialServersDoublesReceiver } from "./availableServerReceiverChoice";
import { getDoublesPartner, getSinglesOpponent } from "./playersHelpers";

export const getInitialServerReceiverForGame = (
  initialServersDoublesReceiver: InitialServersDoublesReceiver,
  gameNumber: number,
): ServerReceiver => {
  const isEvenGame = isEven(gameNumber);
  const isDoubles =
    initialServersDoublesReceiver.firstDoublesReceiver !== undefined;
  if (isDoubles) {
    const initialServer = initialServersDoublesReceiver.gameInitialServers[0];
    const server = getLast(initialServersDoublesReceiver.gameInitialServers);
    const firstDoublesReceiver =
      initialServersDoublesReceiver.firstDoublesReceiver!;
    let receiver: Player;
    if (gameNumber === 1) {
      receiver = firstDoublesReceiver;
    } else {
      const [compareTo, trueValue] = isEvenGame
        ? [firstDoublesReceiver, initialServer]
        : [initialServer, firstDoublesReceiver];
      receiver =
        server === compareTo ? trueValue : getDoublesPartner(trueValue);
    }

    return {
      server,
      receiver,
    };
  } else {
    const game1Server = initialServersDoublesReceiver.gameInitialServers[0];
    const game1Receiver = getSinglesOpponent(game1Server);
    return isEvenGame
      ? { server: game1Receiver, receiver: game1Server }
      : { server: game1Server, receiver: game1Receiver };
  }
};
