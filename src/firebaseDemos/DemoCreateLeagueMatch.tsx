import { push, ref, update } from "firebase/database";
import { useEffect } from "react";
import {
  saveStateToDbMatchSaveState,
  DBMatchSaveState,
} from "../firebase/rtb/match/conversion";
import { DbMatch } from "../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../firebase/rtb/players";
import { useRTB } from "../firebase/rtb/rtbProvider";
import {
  DbLeagueClub,
  DbLeagueTeam,
  DbRegisteredPlayer,
  DbLeagueMatch,
} from "../firebase/rtb/team";
import { Umpire } from "../umpire";
import { getSimpleToday } from "../helpers/getSimpleToday";
import { createTypedValuesUpdater } from "../firebase/rtb/typeHelpers";
import {
  Root,
  useClubsRef,
  useLeagueMatchesRef,
  usePlayersRef,
  useRegisteredPlayersRef,
  useTeamsRef,
} from "../firebase/rtb/root";

export function DemoCreateLeagueMatch() {
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
      const newClubKey = push(clubsRef).key;
      updater.updateListItem("clubs", newClubKey, demoDbLeagueClub);
      return newClubKey;
    };

    const updateTeam = (demoDbLeagueTeam: DbLeagueTeam) => {
      const newTeamKey = push(teamsRef).key;
      updater.updateListItem("teams", newTeamKey, demoDbLeagueTeam);
      return newTeamKey;
    };

    const updatePlayer = (demoPlayer: DbPlayer) => {
      const newPlayerKey = push(playersRef).key;
      updater.updateListItem("players", newPlayerKey, demoPlayer);
      return newPlayerKey;
    };

    const updateRegisteredPlayer = (
      demoRegisteredPlayer: DbRegisteredPlayer,
    ) => {
      const newRegisteredPlayerKey = push(registeredPlayersRef).key;
      updater.updateListItem(
        "registeredPlayers",
        newRegisteredPlayerKey,
        demoRegisteredPlayer,
      );
      return newRegisteredPlayerKey;
    };

    const updateLeagueMatch = (demoLeagueMatch: DbLeagueMatch) => {
      const newLeagueMatchKey = push(leagueMatchesRef).key;
      updater.updateListItem(
        "leagueMatches",
        newLeagueMatchKey,
        demoLeagueMatch,
      );
      return newLeagueMatchKey;
    };

    const maylandsGreenClubKey = updateClub({
      name: "Maylands Green",
    });
    const maylands5TeamKey = updateTeam({
      name: "Maylands Green 5",
      clubId: maylandsGreenClubKey,
      rank: 5,
    });
    const maylands4TeamKey = updateTeam({
      name: "Maylands Green 4",
      clubId: maylandsGreenClubKey,
      rank: 4,
    });
    const maylands6TeamKey = updateTeam({
      name: "Maylands Green 6",
      clubId: maylandsGreenClubKey,
      rank: 4,
    });
    const friendlyTeam1Key = updateTeam({
      name: "Friendly Team 1",
      clubId: maylandsGreenClubKey,
      rank: 0,
    });
    const friendlyTeam2Key = updateTeam({
      name: "Friendly Team 2",
      clubId: maylandsGreenClubKey,
      rank: 0,
    });

    // use full name and will change for the umpire
    const mg5Player1 = updatePlayer({ name: "Tony Hallett" });
    const mg5Player2 = updatePlayer({ name: "Duncan Brown" });
    const mg5Player3 = updatePlayer({ name: "Tony Bonnici" });
    const mg5Player4 = updatePlayer({ name: "Simon Power" });
    const mg5Player5 = updatePlayer({ name: "Ben Agrawal" });
    const mg5Player6 = updatePlayer({ name: "Kamil Luczak" });

    const mg6Player1 = updatePlayer({ name: "A Nonymous" });

    const mg4Player1 = updatePlayer({ name: "Who Ami" });
    const mg4Player2 = updatePlayer({ name: "Random Player" });

    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player1,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player2,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player3,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player4,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player5,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player6,
    });

    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands6TeamKey,
      rank: 6,
      playerId: mg6Player1,
    });

    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands4TeamKey,
      rank: 4,
      playerId: mg4Player1,
    });
    updateRegisteredPlayer({
      clubId: maylandsGreenClubKey,
      teamId: maylands4TeamKey,
      rank: 0,
      playerId: mg4Player2,
    });

    const leagueMatchKey = updateLeagueMatch({
      date: getSimpleToday(),
      isFriendly: true,
      homeTeamId: friendlyTeam1Key,
      awayTeamId: friendlyTeam2Key,
      description: "Maylands Green Friendly Match",
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
      const matchKey = push(matchesRef).key;
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
