import { GameWonState } from ".";

export function getGameWonState(
  team1Points: number,
  team2Points: number,
  upTo: number,
  clearBy2: boolean,
): GameWonState {
  const team1IsUpTo = team1Points >= upTo;
  const team2IsUpTo = team2Points >= upTo;
  const isUpTo = team1IsUpTo || team2IsUpTo;
  if (!isUpTo) {
    return GameWonState.NotWon;
  }
  const pointsDifference = Math.abs(team1Points - team2Points);
  const clearBy = clearBy2 ? 2 : 1;
  if (pointsDifference < clearBy) {
    return GameWonState.NotWon;
  }
  return team1Points > team2Points
    ? GameWonState.Team1Won
    : GameWonState.Team2Won;
}
