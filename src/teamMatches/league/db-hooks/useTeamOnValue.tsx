import { Unsubscribe } from "firebase/database";
import { useState, useRef, useEffect } from "react";
import { useTeamsRef } from "../../../firebase/rtb/root";
import { DbLeagueTeam } from "../../../firebase/rtb/team";
import { onListItemValueTyped } from "../../../firebase/rtb/typeHelpers";

export const useTeamOnValue = (teamId: string | undefined) => {
  const teamsRef = useTeamsRef();
  const [team, setTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const unlistenRef = useRef<Unsubscribe | undefined>(undefined);
  useEffect(() => {
    if (teamId !== undefined) {
      const unlisten = onListItemValueTyped(teamId, teamsRef, (snapshot) => {
        setTeam(snapshot.val());
      });
      unlistenRef.current = () => {
        unlisten();
      };
    }
  }, [teamId, teamsRef]);
  useEffect(() => {
    return () => {
      unlistenRef.current?.();
    };
  }, []);
  return team;
};
