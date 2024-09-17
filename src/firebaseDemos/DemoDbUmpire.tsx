import { onValue, child, ref, Unsubscribe, update } from "firebase/database";
import { useRef, useState, useEffect } from "react";
import {
  dbMatchSaveStateToSaveState,
  saveStateToDbMatchSaveState,
} from "../firebase/rtb/match/conversion";
import { DbMatch, matchesKey } from "../firebase/rtb/match/dbMatch";
import { DbPlayer, playersKey } from "../firebase/rtb/players";
import { useRTB } from "../firebase/rtb/rtbProvider";
import { StatsView } from "../statsViews/StatsView";
import { MatchState, Umpire } from "../umpire";
import { isMatchWon } from "../umpire/getMatchWinState";
import { MatchInfo, PlayerNames, UmpireView } from "../umpireView";
import { getTeamInitials } from "../umpireView/helpers";

export function getTeamLabels(playerNames: PlayerNames) {
  return {
    team1Label: getTeamInitials(
      playerNames.team1Player1Name,
      playerNames.team1Player2Name,
    ),
    team2Label: getTeamInitials(
      playerNames.team2Player1Name,
      playerNames.team2Player2Name,
    ),
  };
}

export function DemoDbUmpire() {
  const db = useRTB();
  const matchKeyRef = useRef<string | undefined>(undefined);
  const dbMatchRef = useRef<DbMatch | undefined>(undefined);
  const matchStateRef = useRef<MatchState | undefined>(undefined);
  const umpireRef = useRef<Umpire | undefined>(undefined);
  const [team1Player1Id, setTeam1Player1Id] = useState<string | undefined>(
    undefined,
  );
  const [team1Player2Id, setTeam1Player2Id] = useState<string | undefined>(
    undefined,
  );
  const [team2Player1Id, setTeam2Player1Id] = useState<string | undefined>(
    undefined,
  );
  const [team2Player2Id, setTeam2Player2Id] = useState<string | undefined>(
    undefined,
  );
  const [team1Player1, setTeam1Player1] = useState<DbPlayer | undefined>(
    undefined,
  );
  const [team1Player2, setTeam1Player2] = useState<DbPlayer | undefined>(
    undefined,
  );
  const [team2Player1, setTeam2Player1] = useState<DbPlayer | undefined>(
    undefined,
  );
  const [team2Player2, setTeam2Player2] = useState<DbPlayer | undefined>(
    undefined,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forceUpdate, setForceUpdate] = useState(0);
  // get the match
  useEffect(() => {
    const unsubscribe = onValue(child(ref(db), matchesKey), (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const demoMatch = childSnapshot.val() as DbMatch;
        matchKeyRef.current = childSnapshot.key;
        dbMatchRef.current = demoMatch;
        setTeam1Player1Id(demoMatch.team1Player1Id!);
        setTeam1Player2Id(demoMatch.team1Player2Id);
        setTeam2Player1Id(demoMatch.team2Player1Id!);
        setTeam2Player2Id(demoMatch.team2Player2Id!);
      });
    });
    return unsubscribe;
  }, [db]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team1Player1Id !== undefined) {
      unsubscribe = onValue(
        child(ref(db), `${playersKey}/${team1Player1Id}`),
        (snapshot) => {
          const team1Player1 = snapshot.val() as DbPlayer;
          setTeam1Player1(team1Player1);
        },
      );
    }
    return unsubscribe;
  }, [db, team1Player1Id]);
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team2Player1Id !== undefined) {
      unsubscribe = onValue(
        child(ref(db), `${playersKey}/${team2Player1Id}`),
        (snapshot) => {
          const team2Player1 = snapshot.val() as DbPlayer;
          setTeam2Player1(team2Player1);
        },
      );
    }
    return unsubscribe;
  }, [db, team2Player1Id]);

  //#region doubles players
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team1Player2Id !== undefined) {
      unsubscribe = onValue(
        child(ref(db), `${playersKey}/${team1Player2Id}`),
        (snapshot) => {
          const team1Player2 = snapshot.val() as DbPlayer;
          setTeam1Player2(team1Player2);
        },
      );
    }
    return unsubscribe;
  }, [db, team1Player2Id]);
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team2Player2Id !== undefined) {
      unsubscribe = onValue(
        child(ref(db), `${playersKey}/${team2Player2Id}`),
        (snapshot) => {
          const team2Player2 = snapshot.val() as DbPlayer;
          setTeam2Player2(team2Player2);
        },
      );
    }
    return unsubscribe;
  }, [db, team2Player2Id]);
  //#endregion
  const dbMatch = dbMatchRef.current;
  const loading =
    dbMatch === undefined ||
    (dbMatch.isDoubles &&
      (team1Player2 === undefined || team2Player2 === undefined)) ||
    team1Player1 === undefined ||
    team2Player1 === undefined;

  if (loading) {
    return <div>loading</div>;
  }

  if (umpireRef.current === undefined) {
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      team1Player1Id,
      team1Player2Id,
      team2Player1Id,
      team2Player2Id,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...dbSaveState
    } = dbMatch;
    const saveState = dbMatchSaveStateToSaveState(dbSaveState);
    umpireRef.current = new Umpire(saveState);
  }
  const umpire = umpireRef.current;

  const matchStateChanged = (newMatchState: MatchState) => {
    matchStateRef.current = newMatchState;
    const saveState = umpire.getSaveState();
    const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
    const updatedMatch: DbMatch = {
      team1Player1Id: dbMatch.team1Player1Id!,
      team2Player1Id: dbMatch.team2Player1Id!,
      scoreboardWithUmpire: dbMatch.scoreboardWithUmpire,
      ...dbMatchSaveState,
    };
    if (dbMatch.team1Player2Id !== undefined) {
      updatedMatch.team1Player2Id = dbMatch.team1Player2Id;
    }
    if (dbMatch.team2Player2Id !== undefined) {
      updatedMatch.team2Player2Id = dbMatch.team2Player2Id;
    }
    const matchRef = child(ref(db), `${matchesKey}/${matchKeyRef.current}`);
    update(matchRef, updatedMatch).catch((reason) =>
      alert(`error updating - ${reason}`),
    );
    setForceUpdate((prev) => prev + 1);
  };

  const matchState = matchStateRef.current ?? umpire.getMatchState();
  const rules: MatchInfo = {
    bestOf: umpire.bestOf,
    upTo: umpire.upTo,
    clearBy2: umpire.clearBy2,
    numServes: umpire.numServes,
    team1EndsAt: umpire.team1MidwayPoints,
    team2EndsAt: umpire.team2MidwayPoints,
  };
  const playerNames: PlayerNames = {
    team1Player1Name: team1Player1.name,
    team1Player2Name: team1Player2?.name,
    team2Player1Name: team2Player1.name,
    team2Player2Name: team2Player2?.name,
  };
  const showStats = true;
  return (
    <>
      <UmpireView
        autoShowServerReceiverChooser={false}
        matchState={matchState}
        rules={rules}
        umpire={{
          // todo - add a scoreboardWithUmpire method changed on the umpire and an optional button/radio to change it
          pointScored(isTeam1) {
            matchStateChanged(umpire.pointScored(isTeam1));
          },
          resetServerReceiver() {
            matchStateChanged(umpire.resetServerReceiver());
          },
          setFirstGameDoublesReceiver(player) {
            matchStateChanged(umpire.setFirstGameDoublesReceiver(player));
          },
          setServer(player) {
            matchStateChanged(umpire.setServer(player));
          },
          switchEnds() {
            matchStateChanged(umpire.switchEnds());
          },
          undoPoint() {
            matchStateChanged(umpire.undoPoint());
          },
        }}
        {...playerNames}
      />
      {showStats && (
        <StatsView
          upTo={rules.upTo}
          bestOf={rules.bestOf}
          gamePoint={rules.upTo - 1}
          team1StartScore={umpire.team1StartGameScore}
          team2StartScore={umpire.team2StartGameScore}
          matchWon={isMatchWon(matchState.matchWinState)}
          currentGameScore={{
            team1Points: matchState.team1Score.points,
            team2Points: matchState.team2Score.points,
          }}
          team1Left={matchState.team1Left}
          gameScores={matchState.gameScores}
          pointHistory={matchState.pointHistory}
          {...getTeamLabels(playerNames)}
        />
      )}
    </>
  );
}
