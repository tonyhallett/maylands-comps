import { FreeScoringMatchSaveState } from "./FreeScoringMatches";
import { CreateMatchOptions } from "./CreateMatch";
import { Umpire } from "../umpire";
import { storeTransactMatchStates } from "./freeScoringStore";

export function createStoredMatch(
  {
    team1Player1Id,
    team1Player2Id,
    team2Player2Id,
    team2Player1Id,
    umpire: umpireTitle,
    title,
    ...matchOptions
  }: CreateMatchOptions,
  id?: string,
): string {
  const lastUsed = new Date().getTime();
  id = id === undefined ? lastUsed.toString() : id;

  const umpire = new Umpire(matchOptions, team1Player2Id !== undefined);
  const saveState = umpire.getSaveState();
  const freeScoringMatchSaveState: FreeScoringMatchSaveState = {
    id,
    lastUsed,
    ...saveState,
    team1Player1Id,
    team1Player2Id,
    team2Player1Id,
    team2Player2Id,
    umpire: umpireTitle,
    title,
  };

  storeTransactMatchStates((freeScoringMatchStates) => {
    freeScoringMatchStates.push(freeScoringMatchSaveState);
  });

  return id;
}
