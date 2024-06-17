import { ServerReceiver } from "./commonTypes";
import { Player } from ".";
import { reachedAlternateServes } from "./reachedAlternateServes";
import { getDoublesPartner, getServiceCycle } from "./playersHelpers";

export type DoublesEndPoints = "NotEnds" | number;
export interface ServingState {
  initialServer: Player;
  initialReceiver: Player;
  doublesEndsPoints: DoublesEndPoints | undefined; // undefined for singles
  team1Points: number;
  team2Points: number;
  pointsWon: number;
  alternateServesAt: number;
  remainingServesAtStartOfGame: number;
  numServes: number;
}

export const shiftInCycle = (
  index: number,
  cycleLength: number,
  shift: number,
): number => {
  return (index + shift) % cycleLength;
};

// this is once the server and receiver have been chosen
export const getServerReceiver = ({
  initialServer,
  initialReceiver,
  doublesEndsPoints,
  pointsWon,
  remainingServesAtStartOfGame,
  numServes,
  alternateServesAt,
  team1Points,
  team2Points,
}: ServingState): ServerReceiver => {
  const hasHadEnds = Number.isInteger(doublesEndsPoints);
  let numServesTakenSinceStartOfCycle =
    numServes - remainingServesAtStartOfGame + pointsWon;
  if (hasHadEnds) {
    const doublesEndsPointsNumber = doublesEndsPoints as number;
    numServesTakenSinceStartOfCycle -= doublesEndsPointsNumber;
    if (doublesEndsPointsNumber % 2 === 1) {
      numServesTakenSinceStartOfCycle += 1;
    }
  }

  const serviceCycle = getServiceCycle(
    initialServer,
    hasHadEnds ? getDoublesPartner(initialReceiver) : initialReceiver,
    doublesEndsPoints !== undefined,
  );
  const serviceCycleLength = serviceCycle.length;

  let numAlternatingServesTaken = 0;
  if (reachedAlternateServes(team1Points, team2Points, alternateServesAt)) {
    const alternateCount = alternateServesAt * 2;
    numAlternatingServesTaken = team1Points + team2Points - alternateCount;
    numServesTakenSinceStartOfCycle -= numAlternatingServesTaken;
  }

  let cycleShift = numAlternatingServesTaken;
  if (hasHadEnds) {
    let switchedCycleShift =
      Math.floor((doublesEndsPoints as number) / numServes) % 4;
    switchedCycleShift = Math.abs(switchedCycleShift - 4);
    cycleShift += switchedCycleShift;
  }
  const startCycleIndex =
    Math.floor(numServesTakenSinceStartOfCycle / numServes) %
    serviceCycleLength;
  const cycleIndex = shiftInCycle(
    startCycleIndex,
    serviceCycleLength,
    cycleShift,
  );
  return serviceCycle[cycleIndex];
};
