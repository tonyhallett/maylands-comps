export interface HandicapOptions {
  team1Handicap: number;
  team2Handicap: number;
  upTo: number;
}

export const shiftHandicap = (
  handicapOptions: HandicapOptions,
): HandicapOptions => {
  const minHandicap = Math.min(
    handicapOptions.team1Handicap,
    handicapOptions.team2Handicap,
  );
  const shift = minHandicap < 0 ? Math.abs(minHandicap) : 0;
  const team1Handicap = handicapOptions.team1Handicap + shift;
  const team2Handicap = handicapOptions.team2Handicap + shift;
  const upTo = handicapOptions.upTo + shift;
  return {
    team1Handicap,
    team2Handicap,
    upTo,
  };
};
