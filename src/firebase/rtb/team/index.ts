import { Root } from "../root";
import { nameof } from "../typeHelpers";

export const registeredPlayersKey = nameof<Root>("registeredPlayers");
export const clubsKey = nameof<Root>("clubs");
export const teamsKey = nameof<Root>("teams");
export const leagueMatchesKey = nameof<Root>("leagueMatches");

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

export interface Livestream {
  identifer?: string | number;
  url: string;
}
export type Livestreams = Record<string, Livestream>;

export interface DbLeagueMatch {
  date: string;
  description: string;
  isFriendly: boolean;
  homeTeamId: string;
  awayTeamId: string;
  liveStreams?: Livestreams;

  // matches will have id back to this
  // match creation order will be the order of the matches
}
