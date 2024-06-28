import { useParams } from "react-router-dom";
import { useFreeScoringLocalStorage } from "./useFreeScoringLocalStorage";
import { Umpire } from "../umpire";
import { UmpireController } from "../demoUmpire/UmpireController";
import { useRef } from "react";

export function FreeScoringMatch() {
  const { matchId } = useParams();
  const umpireRef = useRef<Umpire>();
  const [freeScoringMatchStates, setFreeScoringMatchStates] =
    useFreeScoringLocalStorage([]);
  // better to just index by field - for now
  const matchState = freeScoringMatchStates.find(
    (matchState) => matchState.id === matchId,
  );
  const {
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
        setFreeScoringMatchStates(
          freeScoringMatchStates.map((state) => {
            return state.id === matchId ? { ...state, ...saveState } : state;
          }),
        );
      }}
      umpire={umpireRef.current}
      team1Player1Name={team1Player1Name}
      team2Player1Name={team2Player1Name}
      team1Player2Name={team1Player2Name}
      team2Player2Name={team2Player2Name}
    />
  );
}
