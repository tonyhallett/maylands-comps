import { Umpire } from "../umpire";
import { UmpireController } from "../umpireView/UmpireController";
import { useRef } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import {
  FreeScoringMatchSaveState,
  FreeScoringMatchState,
} from "./FreeScoringMatches";
import { usePostJson } from "./hooks/usePostJson";
interface UmpireControllerRef {
  umpireController: JSX.Element;
  id: string;
}
export function FreeScoringMatch() {
  const umpireControllerRef = useRef<UmpireControllerRef | undefined>();
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
    team1Player1Id,
    team1Player2Id,
    team2Player1Id,
    team2Player2Id,
    umpire,
    title,
    ...saveState
  } = matchState;

  if (
    umpireControllerRef.current === undefined ||
    umpireControllerRef.current.id !== id
  ) {
    const theUmpire = new Umpire(saveState);
    umpireControllerRef.current = {
      id,
      umpireController: (
        <UmpireController
          matchStateChanged={() => {
            const saveState = theUmpire.getSaveState();
            const updatedMatchState: FreeScoringMatchSaveState = {
              id,
              team1Player1Id,
              team1Player2Id,
              team2Player1Id,
              team2Player2Id,
              umpire,
              title,
              ...saveState,
              lastUsed: new Date().getTime(),
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            postJson(updatedMatchState as any);
          }}
          umpire={theUmpire}
          team1Player1Name={team1Player1Name}
          team2Player1Name={team2Player1Name}
          team1Player2Name={team1Player2Name}
          team2Player2Name={team2Player2Name}
        />
      ),
    };
  }
  return umpireControllerRef.current.umpireController;
}
