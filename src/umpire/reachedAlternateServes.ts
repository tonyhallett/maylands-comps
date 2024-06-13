export const reachedAlternateServes = (
  team1Points: number,
  team2Points: number,
  alternateAt: number,
): boolean => {
  return team1Points >= alternateAt && team2Points >= alternateAt;
};
