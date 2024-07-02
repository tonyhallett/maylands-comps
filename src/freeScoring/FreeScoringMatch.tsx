import { Umpire } from "../umpire";
import { UmpireController } from "../demoUmpire/UmpireController";
import { useRef } from "react";
import { useLoaderDataT } from "./useLoaderDataT";
import { FreeScoringMatchState } from "./FreeScoringMatches";
import { usePostJson } from "./usePostJson";

export function FreeScoringMatch() {
  const umpireRef = useRef<Umpire>();
  const matchState = useLoaderDataT<FreeScoringMatchState>();
  const postJson = usePostJson();
  const {
    // to consider https://eslint.org/docs/rules/no-unused-vars#ignorerestsiblings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastUsed,
    team1Player1Name,
    team1Player2Name,
    team2Player1Name,
    team2Player2Name,
    ...saveState
  } = matchState;
  // will want to meno
  if (!umpireRef.current) {
    umpireRef.current = new Umpire(saveState);
  }

  return (
    <UmpireController
      matchStateChanged={() => {
        const saveState = umpireRef.current.getSaveState();
        const updatedMatchState = {
          ...matchState,
          ...saveState,
          lastUsed: new Date().getTime(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postJson(updatedMatchState as any);
      }}
      umpire={umpireRef.current}
      team1Player1Name={team1Player1Name}
      team2Player1Name={team2Player1Name}
      team1Player2Name={team1Player2Name}
      team2Player2Name={team2Player2Name}
    />
  );
}
