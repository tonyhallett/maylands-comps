import { push, child, ref, update } from "firebase/database";
import { useEffect } from "react";
import {
  saveStateToDbMatchSaveState,
  DBMatchSaveState,
} from "../firebase/rtb/match/conversion";
import { matchesKey, DbMatch } from "../firebase/rtb/match/dbMatch";
import { DbPlayer, playersKey } from "../firebase/rtb/players";
import { useRTB } from "../firebase/rtb/rtbProvider";
import {
  clubsKey,
  teamsKey,
  registeredPlayersKey,
  leagueMatchesKey,
  DbLeagueClub,
  DbLeagueTeam,
  DbRegisteredPlayer,
  DbLeagueMatch,
} from "../firebase/rtb/team";
import { Umpire } from "../umpire";
import { getSimpleToday } from "../helpers/getSimpleToday";

export function DemoCreateLeagueMatch() {
  const db = useRTB();
  useEffect(() => {
    const updates = {};

    const updateClub = (
      updates: Record<string, DbLeagueClub>,
      demoDbLeagueClub: DbLeagueClub,
    ) => {
      const newClubKey = push(child(ref(db), clubsKey)).key;
      updates[`${clubsKey}/${newClubKey}`] = demoDbLeagueClub;
      return newClubKey;
    };

    const updateTeam = (
      updates: Record<string, DbLeagueTeam>,
      demoDbLeagueClub: DbLeagueTeam,
    ) => {
      const newTeamKey = push(child(ref(db), teamsKey)).key;
      updates[`${teamsKey}/${newTeamKey}`] = demoDbLeagueClub;
      return newTeamKey;
    };

    const updatePlayer = (
      updates: Record<string, DbPlayer>,
      demoPlayer: DbPlayer,
    ) => {
      const newPlayerKey = push(child(ref(db), playersKey)).key;
      updates[`${playersKey}/${newPlayerKey}`] = demoPlayer;
      return newPlayerKey;
    };

    const updateRegisteredPlayer = (
      updates: Record<string, DbRegisteredPlayer>,
      demoRegisteredPlayer: DbRegisteredPlayer,
    ) => {
      const newRegisteredPlayerKey = push(
        child(ref(db), registeredPlayersKey),
      ).key;
      updates[`${registeredPlayersKey}/${newRegisteredPlayerKey}`] =
        demoRegisteredPlayer;
      return newRegisteredPlayerKey;
    };

    const updateLeagueMatch = (
      updates: Record<string, DbLeagueMatch>,
      demoLeagueMatch: DbLeagueMatch,
    ) => {
      const newLeagueMatchKey = push(child(ref(db), leagueMatchesKey)).key;
      updates[`${leagueMatchesKey}/${newLeagueMatchKey}`] = demoLeagueMatch;
      return newLeagueMatchKey;
    };

    const maylandsGreenClubKey = updateClub(updates, {
      name: "Maylands Green",
    });
    const maylands5TeamKey = updateTeam(updates, {
      name: "Maylands Green 5",
      clubId: maylandsGreenClubKey,
      rank: 5,
    });
    const maylands4TeamKey = updateTeam(updates, {
      name: "Maylands Green 4",
      clubId: maylandsGreenClubKey,
      rank: 4,
    });
    const maylands6TeamKey = updateTeam(updates, {
      name: "Maylands Green 6",
      clubId: maylandsGreenClubKey,
      rank: 4,
    });
    const friendlyTeam1Key = updateTeam(updates, {
      name: "Friendly Team 1",
      clubId: maylandsGreenClubKey,
      rank: 0,
    });
    const friendlyTeam2Key = updateTeam(updates, {
      name: "Friendly Team 2",
      clubId: maylandsGreenClubKey,
      rank: 0,
    });

    // use full name and will change for the umpire
    const mg5Player1 = updatePlayer(updates, { name: "Tony Hallett" });
    const mg5Player2 = updatePlayer(updates, { name: "Duncan Brown" });
    const mg5Player3 = updatePlayer(updates, { name: "Tony Bonnici" });
    const mg5Player4 = updatePlayer(updates, { name: "Simon Power" });
    const mg5Player5 = updatePlayer(updates, { name: "Ben Agrawal" });
    const mg5Player6 = updatePlayer(updates, { name: "Kamil Luczak" });

    const mg6Player1 = updatePlayer(updates, { name: "A Nonymous" });

    const mg4Player1 = updatePlayer(updates, { name: "Who Ami" });
    const mg4Player2 = updatePlayer(updates, { name: "Random Player" });

    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player1,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player2,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player3,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player4,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player5,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands5TeamKey,
      rank: 5,
      playerId: mg5Player6,
    });

    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands6TeamKey,
      rank: 6,
      playerId: mg6Player1,
    });

    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands4TeamKey,
      rank: 4,
      playerId: mg4Player1,
    });
    updateRegisteredPlayer(updates, {
      clubId: maylandsGreenClubKey,
      teamId: maylands4TeamKey,
      rank: 0,
      playerId: mg4Player2,
    });

    const leagueMatchKey = updateLeagueMatch(updates, {
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
      const matchKey = push(child(ref(db), matchesKey)).key;
      const newMatch: DbMatch = {
        scoreboardWithUmpire: true,
        ...dbMatchSaveState,
        containerId: leagueMatchKey,
      };
      updates[`${matchesKey}/${matchKey}`] = newMatch;
    };
    for (let i = 0; i < 9; i++) {
      addMatch(singlesMatchSaveState);
    }
    const doublesMatchSaveState = getDbMatchSaveState(true);
    addMatch(doublesMatchSaveState);

    update(ref(db), updates)
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  }, [db]);
  return null;
}
