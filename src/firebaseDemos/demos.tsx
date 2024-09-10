import {
  child,
  DataSnapshot,
  endAt,
  endBefore,
  equalTo,
  get,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  onValue,
  orderByChild,
  push,
  query,
  Query,
  QueryConstraint,
  ref,
  set,
  startAfter,
  startAt,
  Unsubscribe,
  update,
} from "firebase/database";
import { useRTB } from "../firebase/rtbProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameScore,
  MatchState,
  Player,
  SavePointHistory,
  SaveState,
  Umpire,
} from "../umpire";
import { InitialServersDoublesReceiver } from "../umpire/availableServerReceiverChoice";
import { MatchInfo, PlayerNames, UmpireView } from "../umpireView";
import { StatsView } from "../statsViews/StatsView";
import { isMatchWon } from "../umpire/getMatchWinState";
import { getTeamInitials } from "../umpireView/helpers";
import { Score, Scoreboard } from "../fontDemos/DemoPlayerView/Scoreboard";
import { fontFaces } from "../fontDemos/manualFontInfo";

export function DemoPush() {
  const rtb = useRTB();
  return (
    <button
      onClick={async () => {
        const thingsListRef = ref(rtb, "things");
        try {
          await push(thingsListRef, { p1: true });
          alert("success");
        } catch (reason) {
          alert(`error pushing - ${reason}`);
        }
      }}
    >
      Push
    </button>
  );
}

export function DemoOnValue() {
  const rtb = useRTB();
  useEffect(() => {
    const thingsListRef = ref(rtb, "things");
    const unsubOnValue = onValue(thingsListRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        alert(
          `child key: ${childSnapshot.key} - p1 value: ${childSnapshot.val().p1} - EXISTS ${childSnapshot.exists()}`,
        );
      });
    });
    return unsubOnValue;
  }, [rtb]);
  return null;
}

interface Thing {
  pNumber: number;
}
interface KeyedThing extends Thing {
  key: string;
}

const thingsToAdd: KeyedThing[] = [
  { key: "b", pNumber: 2 },
  { key: "a", pNumber: 1 },
  { key: "c", pNumber: 3 },
  { key: "d", pNumber: 4 },
  { key: "e", pNumber: 2 },
  { key: "f", pNumber: 3 },
];

interface ConstraintInfo {
  constraint?: QueryConstraint;
  info: string;
}

const constraintInfos: ConstraintInfo[] = [
  {
    info: "no filter",
  },
  {
    constraint: equalTo(2),
    info: "equalTo 2",
  },
  {
    constraint: equalTo(2, "b"),
    info: "equalTo 2, key b",
  },
  {
    constraint: equalTo(2, "e"),
    info: "equalTo 2, key e",
  },
  {
    constraint: startAt(2),
    info: "startAt 2",
  },
  {
    constraint: startAt(2, "b"),
    info: "startAt 2 with key b",
  },
  {
    constraint: startAt(2, "c"),
    info: "startAt 2 with key c",
  },
  {
    constraint: startAt(2, "a"),
    info: "startAt 2 with key a",
  },
  {
    constraint: startAfter(2),
    info: "startAfter 2",
  },
  {
    constraint: startAfter(2, "b"),
    info: "startAfter 2, key b",
  },
  {
    constraint: startAfter(2, "c"),
    info: "startAfter 2, key c",
  },
  {
    constraint: startAfter(2, "a"),
    info: "startAfter 2, key a",
  },
  {
    constraint: endAt(3),
    info: "endAt 3",
  },
  {
    constraint: endAt(3, "f"),
    info: "endAt 3, key f",
  },
  {
    constraint: endAt(3, "c"),
    info: "endAt 3, key c",
  },
  {
    constraint: endAt(2),
    info: "endAt 2",
  },
  {
    constraint: endBefore(2),
    info: "endBefore 2",
  },
  {
    constraint: endBefore(2, "e"),
    info: "endBefore 2, key e",
  },
  {
    constraint: endBefore(2, "f"),
    info: "endBefore 2, key f",
  },
  {
    constraint: endBefore(3),
    info: "endBefore 3",
  },
];

export function DemoFiltering() {
  const rtb = useRTB();
  const [added, setAdded] = useState(false);
  const [things, setThings] = useState<KeyedThing[]>([]);
  const [errored, setErrored] = useState(false);
  const thingsListRef = ref(rtb, "things");
  const orderByNumber = orderByChild("pNumber");
  const currentInfoRef = useRef<string | undefined>(undefined);
  const logsRef = useRef<string[]>([]);
  const getOrderedByNumber = useCallback(
    async (constraint: QueryConstraint | undefined, info: string) => {
      currentInfoRef.current = info;
      let snapshot: DataSnapshot;
      let orderByNumberQuery: Query;
      try {
        if (constraint) {
          orderByNumberQuery = query(thingsListRef, constraint, orderByNumber);
        } else {
          orderByNumberQuery = query(thingsListRef, orderByNumber);
        }
        logsRef.current.push(`executing query - ${info}`);
        snapshot = await get(orderByNumberQuery);
        setErrored(false);
      } catch (reason) {
        logsRef.current.push("error querying");
        setThings([]);
        setErrored(true);
        return;
      }
      const queriedThings: KeyedThing[] = [];
      snapshot.forEach((childSnapshot) => {
        //childSnapshot.key;
        const keyedThing = childSnapshot.val() as KeyedThing;
        logsRef.current.push(JSON.stringify(keyedThing));
        queriedThings.push(keyedThing);
      });
      logsRef.current.push("");
      setThings(queriedThings);
    },
    [orderByNumber, thingsListRef],
  );
  /* useEffect(() => {
      let promise: Promise<void> | undefined;
      constraintInfos.forEach((constraintInfo) => {
        if (promise === undefined) {
          promise = getOrderedByNumber(
            constraintInfo.constraint,
            constraintInfo.info,
          );
        } else {
          promise = promise.then(() =>
            getOrderedByNumber(constraintInfo.constraint, constraintInfo.info),
          );
        }
      });
      promise.then(() => {
        console.log(logsRef.current.join("\n"));
      });
    }, [getOrderedByNumber]); */

  const infoMessage = currentInfoRef.current ?? "press button to see things";
  return (
    <>
      <button
        onClick={() => {
          console.log(logsRef.current.join("\n"));
        }}
      >
        Write logs
      </button>
      <button
        style={{ display: "block" }}
        disabled={added}
        onClick={async () => {
          try {
            await Promise.all(
              thingsToAdd.map((thing) => {
                //push(thingsListRef, thing);
                return set(child(thingsListRef, thing.key), thing);
              }),
            );
            setAdded(true);
          } catch (reason) {
            alert("error adding - " + reason);
          }
        }}
      >
        Populate
      </button>
      <br />
      {constraintInfos.map((constraintInfo) => (
        <button
          style={{ display: "block" }}
          key={constraintInfo.info}
          onClick={() => {
            getOrderedByNumber(constraintInfo.constraint, constraintInfo.info);
          }}
        >
          {constraintInfo.info}
        </button>
      ))}
      <div>All things</div>
      <ul>
        {thingsToAdd.map((thing) => (
          <li key={thing.key}>
            {thing.key} - {thing.pNumber}
          </li>
        ))}
      </ul>
      <div>{infoMessage}</div>
      <ul>
        {things.map((thing) => (
          <li key={thing.key}>
            {thing.key} - {thing.pNumber}
          </li>
        ))}
      </ul>
      {errored && <div>error querying</div>}
    </>
  );
}

export function DemoOnChildEvents() {
  const rtb = useRTB();

  useEffect(() => {
    const thingsListRef = ref(rtb, "things");
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const unsubOnChildAdded = onChildAdded(thingsListRef, (snapshot) => {
      alert("child added");
    });
    const unsubOnChildRemoved = onChildRemoved(thingsListRef, (snapshot) => {
      alert("child removed");
    });
    const unsubOnChildChanged = onChildChanged(thingsListRef, (snapshot) => {
      alert("child changed");
    });
    const unsubOnChildMoved = onChildMoved(thingsListRef, (snapshot) => {
      alert("child moved");
    });
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return () => {
      unsubOnChildAdded();
      unsubOnChildRemoved();
      unsubOnChildChanged();
      unsubOnChildMoved();
    };
  }, [rtb]);
  return null;
}

export interface ObjectPointHistory {
  [key: string]:
    | "empty"
    | {
        [key: string]: SavePointHistory;
      };
}
export interface ObjectGameScores {
  [key: string]: GameScore;
}

export interface DbInitialServersDoublesReceiver {
  gameInitialServers?: Record<Player, true>;
  firstDoublesReceiver?: Player;
}
export type DBMatchSaveState = Omit<
  SaveState,
  "pointHistory" | "gameScores" | "initialServersDoublesReceiver"
> & {
  pointHistory: ObjectPointHistory;
  gameScores?: ObjectGameScores;
  initialServersDoublesReceiver?: DbInitialServersDoublesReceiver;
};
interface DbPlayer {
  name: string;
}
interface DbTeam {
  player1Id: string;
  player2Id?: string;
}
interface DbMatch extends DBMatchSaveState {
  team1Id: string;
  team2Id: string;
  scoreboardWithUmpire: boolean;
}

export function dbMatchSaveStateToSaveState(
  dbMatchSaveState: DBMatchSaveState,
): SaveState {
  const { pointHistory, gameScores, initialServersDoublesReceiver, ...rest } =
    dbMatchSaveState;
  const saveGameScores =
    gameScores === undefined ? [] : Object.values(gameScores);

  const savePointHistory = Object.values(pointHistory).map(
    (gamePointHistory) => {
      if (gamePointHistory === "empty") {
        return [] as SavePointHistory[];
      }
      return Object.values(gamePointHistory);
    },
  );
  let saveInitialServersDoublesReceiver: InitialServersDoublesReceiver;
  if (initialServersDoublesReceiver === undefined) {
    saveInitialServersDoublesReceiver = {
      gameInitialServers: [],
      firstDoublesReceiver: undefined,
    };
  } else {
    saveInitialServersDoublesReceiver = {
      gameInitialServers: Object.keys(
        initialServersDoublesReceiver.gameInitialServers,
      ) as Player[],
      firstDoublesReceiver: initialServersDoublesReceiver.firstDoublesReceiver,
    };
  }

  return {
    ...rest,
    pointHistory: savePointHistory, //todo
    gameScores: saveGameScores,
    initialServersDoublesReceiver: saveInitialServersDoublesReceiver,
  };
}

export function saveStateToDbMatchSaveState(
  saveState: SaveState,
): DBMatchSaveState {
  const { pointHistory, gameScores, initialServersDoublesReceiver, ...rest } =
    saveState;

  const dbInitialServersDoublesReceiver: DbInitialServersDoublesReceiver = {
    gameInitialServers: initialServersDoublesReceiver.gameInitialServers.reduce(
      (acc, player) => {
        acc[player] = true;
        return acc;
      },
      {} as Record<Player, true>,
    ),
  };
  if (initialServersDoublesReceiver.firstDoublesReceiver !== undefined) {
    dbInitialServersDoublesReceiver.firstDoublesReceiver =
      initialServersDoublesReceiver.firstDoublesReceiver;
  }
  return {
    ...rest,
    gameScores: gameScores.reduce((acc, gameScore, gameIndex) => {
      acc[gameIndex.toString()] = gameScore;
      return acc;
    }, {}),
    pointHistory: pointHistory.reduce((acc, gamePointHistory, gameIndex) => {
      if (gamePointHistory.length > 0) {
        acc[gameIndex.toString()] = gamePointHistory.reduce(
          (acc, pointHistory, pointIndex) => {
            acc[pointIndex.toString()] = pointHistory;
            return acc;
          },
          {},
        );
      } else {
        acc[gameIndex.toString()] = "empty";
      }
      return acc;
    }, {}),
    initialServersDoublesReceiver: dbInitialServersDoublesReceiver,
  };
}

let matchKey: string | undefined;
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
      const newPlayerKey = push(child(ref(db), playersKey)).key;
      updates[`${playersKey}/${newPlayerKey}`] = demoPlayer;
      return newPlayerKey;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateTeam = (updates: Record<string, any>, demoTeam: DbTeam) => {
      const teamsKey = "teams";
      const newTeamKey = push(child(ref(db), teamsKey)).key;
      updates[`${teamsKey}/${newTeamKey}`] = demoTeam;
      return newTeamKey;
    };
    const team1Player1Key = updatePlayer(updates, { name: "T Hallett" });
    const team1Player2Key = updatePlayer(updates, { name: "T Bonnici" });
    const team2Player1Key = updatePlayer(updates, { name: "D Brown" });
    const team2Player2Key = updatePlayer(updates, { name: "R Hucker" });
    const team1Key = updateTeam(updates, {
      player1Id: team1Player1Key,
      player2Id: team1Player2Key,
    });
    const team2Key = updateTeam(updates, {
      player1Id: team2Player1Key,
      player2Id: team2Player2Key,
    });
    const matchesKey = "matches";
    matchKey = push(child(ref(db), matchesKey)).key;
    const umpire = new Umpire(
      {
        bestOf: 5,
        clearBy2: true,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        upTo: 11,
      },
      true,
    );
    const umpireSaveState = umpire.getSaveState();
    const dbMatchSaveState = saveStateToDbMatchSaveState(umpireSaveState);
    const newMatch: DbMatch = {
      team1Id: team1Key,
      team2Id: team2Key,
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

export function DemoDbUmpire() {
  const db = useRTB();
  const dbMatchRef = useRef<DbMatch | undefined>(undefined);
  const matchStateRef = useRef<MatchState | undefined>(undefined);
  const umpireRef = useRef<Umpire | undefined>(undefined);
  const [team1Id, setTeam1Id] = useState<string | undefined>(undefined);
  const [team2Id, setTeam2Id] = useState<string | undefined>(undefined);
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
    // if knew the match ref
    /* const matchRef = child(ref(db), `matches/${matchKey}`);
    // error handling to do
    const unsubscribe = onValue(matchRef, (snapshot) => {
      // what happens if the match is deleted?
      const exists = snapshot.exists();
      if (exists) {
        const demoMatch = snapshot.val() as DbMatch;
        dbMatchRef.current = demoMatch;
        setTeam1Id(demoMatch.team1Id);
        setTeam2Id(demoMatch.team2Id);
      }
    }); */
    const unsubscribe = onValue(child(ref(db), `matches`), (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const demoMatch = childSnapshot.val() as DbMatch;
        dbMatchRef.current = demoMatch;
        setTeam1Id(demoMatch.team1Id);
        setTeam2Id(demoMatch.team2Id);
      });
    });
    return unsubscribe;
  }, [db]);
  //#region get the teams
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team1Id !== undefined) {
      unsubscribe = onValue(child(ref(db), `teams/${team1Id}`), (snapshot) => {
        const team1 = snapshot.val() as DbTeam;
        setTeam1Player1Id(team1.player1Id);
        setTeam1Player2Id(team1.player2Id);
      });
    }
    return unsubscribe;
  }, [db, team1Id]);
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team2Id !== undefined) {
      unsubscribe = onValue(child(ref(db), `teams/${team2Id}`), (snapshot) => {
        const team2 = snapshot.val() as DbTeam;
        setTeam2Player1Id(team2.player1Id);
        setTeam2Player2Id(team2.player2Id);
      });
    }
    return unsubscribe;
  }, [db, team2Id]);
  //#endregion
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (team1Player1Id !== undefined) {
      unsubscribe = onValue(
        child(ref(db), `players/${team1Player1Id}`),
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
        child(ref(db), `players/${team2Player1Id}`),
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
        child(ref(db), `players/${team1Player2Id}`),
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
        child(ref(db), `players/${team2Player2Id}`),
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { team1Id: _, team2Id: __, ...dbSaveState } = dbMatch;
    const saveState = dbMatchSaveStateToSaveState(dbSaveState);
    umpireRef.current = new Umpire(saveState);
  }
  const umpire = umpireRef.current;

  const matchStateChanged = (newMatchState: MatchState) => {
    matchStateRef.current = newMatchState;
    const saveState = umpire.getSaveState();
    const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
    const updatedMatch: DbMatch = {
      team1Id: dbMatch.team1Id,
      team2Id: dbMatch.team2Id,
      scoreboardWithUmpire: dbMatch.scoreboardWithUmpire,
      ...dbMatchSaveState,
    };
    const matchRef = child(ref(db), `matches/${matchKey}`);
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

function getTeamLabels(playerNames: PlayerNames) {
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

export function DemoDbPlayersView() {
  const db = useRTB();
  const [score, setScore] = useState<Score | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = onValue(child(ref(db), `matches`), (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const demoMatch = childSnapshot.val() as DbMatch;
        const scoreboardWithUmpire = demoMatch.scoreboardWithUmpire;
        const scoreboardTeam1Left = scoreboardWithUmpire
          ? !demoMatch.team1Left
          : demoMatch.team1Left;
        if (scoreboardTeam1Left) {
          setScore({
            left: demoMatch.team1Score,
            right: demoMatch.team2Score,
          });
        } else {
          setScore({
            left: demoMatch.team2Score,
            right: demoMatch.team1Score,
          });
        }
      });
    });
    return unsubscribe;
  }, [db]);
  if (score === undefined) {
    return <div>loading</div>;
  }
  return (
    <Scoreboard
      score={score}
      fontInfo={{
        weight: "400",
        fontInfo: fontFaces[3],
      }}
    />
  );
}
