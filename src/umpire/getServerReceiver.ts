import { ServerReceiver } from "./commonTypes";
import { Player } from ".";
import { reachedAlternateServes } from "./reachedAlternateServes";
import { getDoublesServiceCycle } from "./playersHelpers";

interface EndsInfo {
  isDecider: boolean;
  team1MidwayPoints: number;
  team2MidwayPoints: number;
}
export interface ServingState {
  initialServer: Player;
  initialReceiver: Player;
  endsInfo: EndsInfo | undefined; // undefined for singles
  team1Points: number;
  team2Points: number;
  pointsWon: number;
  alternateServesAt: number;
  remainingServesAtStartOfGame: number;
  numServes: number;
}

// this is once the server and receiver have been chosen
export const getServerReceiver = ({
  initialServer,
  initialReceiver,
  endsInfo,
  pointsWon,
  remainingServesAtStartOfGame,
  numServes,
  alternateServesAt,
  team1Points,
  team2Points,
}: ServingState): ServerReceiver => {
  let numServesTaken = numServes - remainingServesAtStartOfGame + pointsWon;
  let server = initialServer;
  let receiver = initialReceiver;

  const singles = endsInfo === undefined;
  if (singles) {
    let alternateSwitch = false;
    if (reachedAlternateServes(team1Points, team2Points, alternateServesAt)) {
      const alternateCount = alternateServesAt * 2;
      const additional = team1Points + team2Points - alternateCount;
      if (additional > 0) {
        numServesTaken -= additional;
        alternateSwitch = additional % 1 === 0;
      }
    }
    // should be able to use same principal for doubles - use 4 and look into the cycle AND ADJUST FOR ENDS
    let switchServer = Math.floor(numServesTaken / numServes) % 2 === 1;
    if (alternateSwitch) {
      switchServer = !switchServer;
    }
    if (switchServer) {
      server = initialReceiver;
      receiver = initialServer;
    }
  } else {
    // todo
    const serviceCycle = getDoublesServiceCycle(initialServer, initialReceiver);
    const serviceCycleIndex = Math.floor(numServesTaken / numServes) % 4;
    const serverReceiver = serviceCycle[serviceCycleIndex];
    server = serverReceiver.server;
    receiver = serverReceiver.receiver;
  }

  return {
    server,
    receiver,
  };
};
