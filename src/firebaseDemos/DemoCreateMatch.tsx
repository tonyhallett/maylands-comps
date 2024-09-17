import { child, ref, update } from "firebase/database";
import { useEffect } from "react";
import { saveStateToDbMatchSaveState } from "../firebase/rtb/match/conversion";
import { DbMatch } from "../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../firebase/rtb/players";
import { useRTB } from "../firebase/rtb/rtbProvider";
import { Umpire } from "../umpire";
import { getNewKey } from "../firebase/rtb/typeHelpers";

export function DemoCreateMatch() {
  const db = useRTB();
  useEffect(() => {
    const updates = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePlayer = (
      updates: Record<string, DbPlayer>,
      demoPlayer: DbPlayer,
    ) => {
      const playersKey = "players";
      const newPlayerKey = getNewKey(child(ref(db), playersKey));
      updates[`${playersKey}/${newPlayerKey}`] = demoPlayer;
      return newPlayerKey;
    };

    const team1Player1Key = updatePlayer(updates, { name: "T Hallett" });
    const team2Player1Key = updatePlayer(updates, { name: "D Adcock" });

    const matchesKey = "matches";
    const matchKey = getNewKey(child(ref(db), matchesKey));
    const umpire = new Umpire(
      {
        bestOf: 5,
        clearBy2: true,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        upTo: 11,
      },
      false,
    );
    const umpireSaveState = umpire.getSaveState();
    const dbMatchSaveState = saveStateToDbMatchSaveState(umpireSaveState);
    const newMatch: DbMatch = {
      team1Player1Id: team1Player1Key,
      team2Player1Id: team2Player1Key,
      scoreboardWithUmpire: true,
      ...dbMatchSaveState,
    };
    updates[`${matchesKey}/${matchKey}`] = newMatch;
    update(ref(db), updates)
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  }, [db]);
  return null;
}
