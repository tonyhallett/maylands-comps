import { useRef } from "react";
import { DbMatch } from "./match/dbMatch";
import { DbPlayer } from "./players";
import { useRTB } from "./rtbProvider";
import {
  DbLeagueClub,
  DbLeagueMatch,
  DbLeagueTeam,
  DbRegisteredPlayer,
} from "./team";
import { createTypedRefHelper } from "./typeHelpers";

export interface Root {
  players: Record<string, DbPlayer>;
  clubs: Record<string, DbLeagueClub>;
  teams: Record<string, DbLeagueTeam>;
  registeredPlayers: Record<string, DbRegisteredPlayer>;
  leagueMatches: Record<string, DbLeagueMatch>;
  matches: Record<string, DbMatch>;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const demoRoot: Root = null as any;
export const refTyped = createTypedRefHelper(demoRoot);

export const useLeagueMatchesRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "leagueMatches")).current;
};
export const useRegisteredPlayersRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "registeredPlayers")).current;
};
export const usePlayersRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "players")).current;
};
export const useTeamsRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "teams")).current;
};
export const useClubsRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "clubs")).current;
};
export const useMatchesRef = () => {
  const db = useRTB();
  return useRef(refTyped(db, "matches")).current;
};
