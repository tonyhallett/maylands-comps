import { useEffect, useRef, useState } from "react";
import { useFirestore } from "../../firebase/firestoreProvider";
import { fontFaces } from "../manualFontInfo";
import { Score, Scoreboard } from "./Scoreboard";
import {
  disableNetwork,
  doc,
  enableNetwork,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import { goOffline, goOnline, onValue, ref, set } from "firebase/database";

export function DemoFirestoreScorer() {
  const firestore = useFirestore();
  const scoresRef = doc(firestore, "demoscores", "demo");
  const createdDocRef = useRef(false);
  const demoGameScoreRef = useRef<Score | null>(null);
  const [disabledNetwork, setDisabledNetwork] = useState(false);
  useEffect(() => {
    if (createdDocRef.current) return;
    const demoScore: Score = {
      left: {
        games: 0,
        points: 0,
      },
      right: {
        games: 0,
        points: 0,
      },
    };
    demoGameScoreRef.current = demoScore;
    setDoc(scoresRef, demoScore)
      .then(() => {
        createdDocRef.current = true;
      })
      .catch((reason) => {
        alert(`error creating doc - ${reason}`);
      });
    /* getDoc(scoresRef).then((snapshot) => {
      const demoGameScore = snapshot.data() as DemoGameScore;
      demoGameScoreRef.current = demoGameScore;
    }); */
  }, [scoresRef, createdDocRef]);
  return (
    <>
      <button
        disabled={disabledNetwork}
        onClick={async () => {
          try {
            await disableNetwork(firestore);
            setDisabledNetwork(true);
          } catch (reason) {
            alert(`error disabling network - ${reason}`);
          }
        }}
      >
        Disable network
      </button>
      <button
        disabled={!disabledNetwork}
        onClick={async () => {
          try {
            await enableNetwork(firestore);
            setDisabledNetwork(false);
          } catch (reason) {
            alert(`error enabling network - ${reason}`);
          }
        }}
      >
        Enable network
      </button>
      <button
        onClick={async () => {
          const score = demoGameScoreRef.current;
          score.right.points = score.right.points + 1;
          try {
            await setDoc(scoresRef, score);
          } catch (reason) {
            alert(`error updating doc - ${reason}`);
          }
        }}
      >
        Change
      </button>
    </>
  );
}

export function DemoFirestorePlayerView() {
  const firestore = useFirestore();
  const [score, setScore] = useState<Score>({
    left: {
      games: 0,
      points: 0,
    },
    right: {
      games: 0,
      points: 0,
    },
  });
  useEffect(() => {
    const unsub = onSnapshot(doc(firestore, "demoscores", "demo"), (doc) => {
      const gameScore = doc.data() as Score;
      setScore(gameScore);
    });
    return unsub;
  }, [firestore]);
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

export function DemoRtbScorer() {
  const rtb = useRTB();
  const scoresRef = ref(rtb, "demoScore");
  const createdDocRef = useRef(false);
  const demoGameScoreRef = useRef<Score | null>(null);
  const [disabledNetwork, setDisabledNetwork] = useState(false);
  useEffect(() => {
    if (createdDocRef.current) return;
    const demoScore: Score = {
      left: {
        games: 0,
        points: 0,
      },
      right: {
        games: 0,
        points: 0,
      },
    };
    demoGameScoreRef.current = demoScore;
    set(scoresRef, demoScore)
      .then(() => {
        createdDocRef.current = true;
      })
      .catch((reason) => {
        alert(`error creating doc - ${reason}`);
      });
  }, [scoresRef, createdDocRef]);
  return (
    <>
      <button
        disabled={disabledNetwork}
        onClick={() => {
          try {
            goOffline(rtb);
            setDisabledNetwork(true);
          } catch (reason) {
            alert(`error disabling network - ${reason}`);
          }
        }}
      >
        Disable network
      </button>
      <button
        disabled={!disabledNetwork}
        onClick={() => {
          try {
            goOnline(rtb);
            setDisabledNetwork(false);
          } catch (reason) {
            alert(`error enabling network - ${reason}`);
          }
        }}
      >
        Enable network
      </button>
      <button
        onClick={async () => {
          const score = demoGameScoreRef.current;
          score.right.points = score.right.points + 1;
          try {
            await set(scoresRef, score);
          } catch (reason) {
            alert(`error updating doc - ${reason}`);
          }
        }}
      >
        Change
      </button>
    </>
  );
}

export function DemoRtbPlayerView() {
  const rtb = useRTB();
  const scoresRef = ref(rtb, "demoScore");
  const [score, setScore] = useState<Score>({
    left: {
      games: 0,
      points: 0,
    },
    right: {
      games: 0,
      points: 0,
    },
  });
  useEffect(() => {
    const unsub = onValue(scoresRef, (doc) => {
      if (doc !== null) {
        const gameScore = doc.val() as Score;
        setScore(gameScore);
      }
    });
    return unsub;
  }, [scoresRef]);
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
