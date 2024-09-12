export const registeredPlayersKey = "registeredPlayers";
export const clubsKey = "clubs";
export const teamsKey = "teams";
export const leagueMatchesKey = "leagueMatches";

export interface DbRegisteredPlayer {
  // possible to combine these for a query ?
  clubId: string;
  teamId: string;
  rank: number;
  playerId: string;
  // appearances todo
}

export interface DbLeagueTeam {
  name: string;
  clubId: string;
  rank: number;
}

export interface DbLeagueClub {
  name: string;
}

export interface DbLeagueMatch {
  date: string;
  description: string;
  isFriendly: boolean;
  homeTeamId: string;
  awayTeamId: string;

  // matches will have id back to this
  // match creation order will be the order of the matches
}
