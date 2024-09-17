import { ref, update } from "firebase/database";
import { useEffect } from "react";
import {
  saveStateToDbMatchSaveState,
  DBMatchSaveState,
} from "../../firebase/rtb/match/conversion";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../../firebase/rtb/players";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import {
  DbLeagueClub,
  DbLeagueTeam,
  DbRegisteredPlayer,
  DbLeagueMatch,
} from "../../firebase/rtb/team";
import { Umpire } from "../../umpire";
import { getSimpleToday } from "../../helpers/getSimpleToday";
import {
  createTypedValuesUpdater,
  getNewKey,
} from "../../firebase/rtb/typeHelpers";
import {
  Root,
  useClubsRef,
  useLeagueMatchesRef,
  usePlayersRef,
  useRegisteredPlayersRef,
  useTeamsRef,
} from "../../firebase/rtb/root";
import { clubSetups, maylandsFixtures } from "./romfordLeagueData";

export function CreateLeagueSeason() {
  const db = useRTB();
  const leagueMatchesRef = useLeagueMatchesRef();
  const registeredPlayersRef = useRegisteredPlayersRef();
  const matchesRef = useTeamsRef();
  const clubsRef = useClubsRef();
  const teamsRef = useTeamsRef();
  const playersRef = usePlayersRef();
  useEffect(() => {
    const updater = createTypedValuesUpdater<Root>();
    const updateClub = (demoDbLeagueClub: DbLeagueClub) => {
      const newClubKey = getNewKey(clubsRef);
      updater.updateListItem("clubs", newClubKey, demoDbLeagueClub);
      return newClubKey!;
    };

    const updateTeam = (demoDbLeagueTeam: DbLeagueTeam) => {
      const newTeamKey = getNewKey(teamsRef);
      updater.updateListItem("teams", newTeamKey!, demoDbLeagueTeam);
      return newTeamKey!;
    };

    const updatePlayer = (demoPlayer: DbPlayer) => {
      const newPlayerKey = getNewKey(playersRef);
      updater.updateListItem("players", newPlayerKey!, demoPlayer);
      return newPlayerKey!;
    };

    const updateRegisteredPlayer = (
      demoRegisteredPlayer: DbRegisteredPlayer,
    ) => {
      const newRegisteredPlayerKey = getNewKey(registeredPlayersRef);
      updater.updateListItem(
        "registeredPlayers",
        newRegisteredPlayerKey,
        demoRegisteredPlayer,
      );
      return newRegisteredPlayerKey;
    };

    const updateLeagueMatch = (demoLeagueMatch: DbLeagueMatch) => {
      const newLeagueMatchKey = getNewKey(leagueMatchesRef);
      updater.updateListItem(
        "leagueMatches",
        newLeagueMatchKey,
        demoLeagueMatch,
      );
      return newLeagueMatchKey;
    };

    const teamNameKeys = clubSetups.flatMap((clubSetup) => {
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
      const teamNameKey = teamNameKeys.find(
        (teamNameKey) => teamNameKey.name === teamName,
      );
      if (!teamNameKey) {
        throw new Error(`team not found - ${teamName}`);
      }
      return teamNameKey.teamKey;
    };
    maylandsFixtures.forEach((fixture) => {
      const leagueMatchKey = updateLeagueMatch({
        date: getSimpleToday(), // later will do proper date
        isFriendly: false,
        homeTeamId: getTeamKey(fixture.homeTeam),
        awayTeamId: getTeamKey(fixture.awayTeam),
        description: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      });
      const getDbMatchSaveState = (isDoubles: boolean) => {
        const umpire = new Umpire(
          {
            bestOf: 5,
            clearBy2: true,
            numServes: 2,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            upTo: 11,
          },
          isDoubles,
        );
        const umpireSaveState = umpire.getSaveState();
        return saveStateToDbMatchSaveState(umpireSaveState);
      };
      const singlesMatchSaveState = getDbMatchSaveState(false);
      const addMatch = (dbMatchSaveState: DBMatchSaveState) => {
        const matchKey = getNewKey(matchesRef);
        const newMatch: DbMatch = {
          scoreboardWithUmpire: true,
          ...dbMatchSaveState,
          containerId: leagueMatchKey,
        };
        updater.updateListItem("matches", matchKey, newMatch);
      };
      for (let i = 0; i < 9; i++) {
        addMatch(singlesMatchSaveState);
      }
      const doublesMatchSaveState = getDbMatchSaveState(true);
      addMatch(doublesMatchSaveState);
    });

    update(ref(db), updater.values)
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  }, [
    db,
    leagueMatchesRef,
    registeredPlayersRef,
    matchesRef,
    clubsRef,
    teamsRef,
    playersRef,
  ]);
  return null;
}
