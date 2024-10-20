import { useEffect } from "react";
import { DBMatchSaveState } from "../../../firebase/rtb/match/conversion";
import { DbMatch } from "../../../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../../../firebase/rtb/players";
import { useRTBGetNewKey } from "../../../firebase/rtb/rtbProvider";
import {
  DbLeagueClub,
  DbLeagueTeam,
  DbRegisteredPlayer,
  DbLeagueMatch,
} from "../../../firebase/rtb/team";
import { getDbDate } from "../../../helpers/getDbDate";
import {
  useClubsRef,
  useLeagueMatchesRef,
  usePlayersRef,
  useRegisteredPlayersRef,
  useTeamsRef,
} from "../../../firebase/rtb/root";
import { clubSetups, maylandsFixtures } from "./data/romfordLeagueData";
import { getInitialDbMatchSaveState } from "./getInitialDbMatchSaveState";

export type PromiseCallback = (promise: Promise<void>) => void;
export function useCreateLeagueSeason(
  fixtures: typeof maylandsFixtures,
  promiseCallback: PromiseCallback,
) {
  const { getNewKey, createRootUpdater } = useRTBGetNewKey();
  const leagueMatchesRef = useLeagueMatchesRef();
  const registeredPlayersRef = useRegisteredPlayersRef();
  const matchesRef = useTeamsRef();
  const clubsRef = useClubsRef();
  const teamsRef = useTeamsRef();
  const playersRef = usePlayersRef();
  useEffect(() => {
    const { updateListItem, update } = createRootUpdater();
    const updateClub = (leagueClub: DbLeagueClub) => {
      const newClubKey = getNewKey();
      updateListItem("clubs", newClubKey, leagueClub);
      return newClubKey!;
    };

    const updateTeam = (leagueTeam: DbLeagueTeam) => {
      const newTeamKey = getNewKey();
      updateListItem("teams", newTeamKey, leagueTeam);
      return newTeamKey!;
    };

    const updatePlayer = (player: DbPlayer) => {
      const newPlayerKey = getNewKey();
      updateListItem("players", newPlayerKey!, player);
      return newPlayerKey!;
    };

    const updateRegisteredPlayer = (registeredPlayer: DbRegisteredPlayer) => {
      const newRegisteredPlayerKey = getNewKey();
      updateListItem(
        "registeredPlayers",
        newRegisteredPlayerKey,
        registeredPlayer,
      );
      return newRegisteredPlayerKey;
    };

    const updateLeagueMatch = (leagueMatch: DbLeagueMatch) => {
      const newLeagueMatchKey = getNewKey();
      updateListItem("leagueMatches", newLeagueMatchKey, leagueMatch);
      return newLeagueMatchKey;
    };

    const teamNameAndKeys = clubSetups.flatMap((clubSetup) => {
      const clubKey = updateClub({ name: clubSetup.clubName });
      return clubSetup.teamSetups.map((teamSetup) => {
        const teamKey = updateTeam({
          rank: teamSetup.rank,
          name: teamSetup.teamName,
          clubId: clubKey,
        });
        teamSetup.playerNames.forEach((player) => {
          const playerKey = updatePlayer({ name: player });
          updateRegisteredPlayer({
            clubId: clubKey,
            teamId: teamKey,
            playerId: playerKey,
            rank: teamSetup.rank,
          });
        });
        return {
          teamKey,
          name: teamSetup.teamName,
        };
      });
    });
    const getTeamKey = (teamName: string) => {
      const teamNameKey = teamNameAndKeys.find(
        (teamNameKey) => teamNameKey.name === teamName,
      );
      if (!teamNameKey) {
        throw new Error(`team not found - ${teamName}`);
      }
      return teamNameKey.teamKey;
    };
    fixtures.forEach((fixture) => {
      const leagueMatchKey = updateLeagueMatch({
        date: getDbDate(fixture.date),
        isFriendly: false,
        homeTeamId: getTeamKey(fixture.homeTeam),
        awayTeamId: getTeamKey(fixture.awayTeam),
        description: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      });
      const singlesMatchSaveState = getInitialDbMatchSaveState(false);
      const addMatch = (dbMatchSaveState: DBMatchSaveState) => {
        const matchKey = getNewKey();
        const newMatch: DbMatch = {
          scoreboardWithUmpire: true,
          ...dbMatchSaveState,
          containerId: leagueMatchKey,
        };
        updateListItem("matches", matchKey, newMatch);
      };
      for (let i = 0; i < 9; i++) {
        addMatch(singlesMatchSaveState);
      }
      const doublesMatchSaveState = getInitialDbMatchSaveState(true);
      addMatch(doublesMatchSaveState);
    });

    promiseCallback(update());
  }, [
    getNewKey,
    createRootUpdater,
    leagueMatchesRef,
    registeredPlayersRef,
    matchesRef,
    clubsRef,
    teamsRef,
    playersRef,
    fixtures,
    promiseCallback,
  ]);
}
