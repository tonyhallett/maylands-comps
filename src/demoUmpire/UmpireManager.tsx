import { MatchOptions, Umpire } from "../umpire";
import { PlayerNames } from ".";
import { UmpireController } from "./UmpireController";

export interface UmpireManagerOptions extends PlayerNames, MatchOptions {
  team1StartGameScore: number;
  team2StartGameScore: number;
}
export function UmpireManager(props: { options: UmpireManagerOptions }) {
  const {
    bestOf,
    clearBy2,
    numServes,
    upTo,
    team1StartGameScore,
    team2StartGameScore,
    ...playerNames
  } = props.options;
  const umpire = new Umpire(
    {
      clearBy2,
      numServes,
      upTo,
      team1StartGameScore,
      team2StartGameScore,
      bestOf,
    },
    playerNames.team1Player2Name !== undefined,
  );

  return <UmpireController umpire={umpire} {...playerNames} />;
}
