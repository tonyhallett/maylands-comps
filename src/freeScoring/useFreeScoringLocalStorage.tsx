import { useLocalStorage } from "usehooks-ts";
import { FreeScoringMatchState } from "./FreeScoringMatches";

export function useFreeScoringLocalStorage(
  initialValue: FreeScoringMatchState[],
) {
  return useLocalStorage<FreeScoringMatchState[]>(
    "freeScoringMatchStates",
    initialValue,
  );
}
