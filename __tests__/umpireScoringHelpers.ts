import { Umpire } from "../src/umpire";

export const scorePoints = (umpire: Umpire, team1: boolean, n: number) => {
  [...Array(n)].forEach(() => umpire.pointScored(team1));
  return umpire.getMatchState();
};
export const scoreGames = (
  umpire: Umpire,
  team1: boolean,
  n: number,
  gamePoints = 11,
) => {
  [...Array(n)].forEach(() => scorePoints(umpire, team1, gamePoints));
  return umpire.getMatchState();
};
