import { MatchState, TeamScore } from ".";

const teamScored = (teamScore: TeamScore) => {
  return teamScore.games > 0 || teamScore.points > 0;
};

export const hasScored = (matchState: MatchState) =>
  teamScored(matchState.team1Score) || teamScored(matchState.team2Score);
