import { onValue, child, ref } from "firebase/database";
import { useState, useEffect } from "react";
import { DbMatch, matchesKey } from "../firebase/rtb/match/dbMatch";
import { useRTB } from "../firebase/rtb/rtbProvider";
import { Score, Scoreboard } from "../fontDemos/DemoPlayerView/Scoreboard";
import { fontFaces } from "../fontDemos/manualFontInfo";

export function DemoDbScoreboard() {
  const db = useRTB();
  const [score, setScore] = useState<Score | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = onValue(child(ref(db), matchesKey), (snapshot) => {
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
