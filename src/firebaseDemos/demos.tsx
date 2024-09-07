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
} from "firebase/database";
import { useRTB } from "../firebase/rtbProvider";
import { useCallback, useEffect, useRef, useState } from "react";

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
