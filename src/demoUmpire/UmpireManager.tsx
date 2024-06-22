import { Umpire } from "../umpire";
import { PlayerNames } from ".";
import { UmpireController } from "./UmpireController";
import { Typography } from "@mui/material";

export interface MatchOptions extends PlayerNames {
  upTo: number;
  bestOf: number;
  team1StartGameScore: number;
  team2StartGameScore: number;

  numServes: number;
  competitionDescription: string;
  isDoubles: boolean;
  clearBy2: boolean;
}
export function UmpireManager(props: { options: MatchOptions }) {
  const {
    bestOf,
    isDoubles,
    clearBy2,
    numServes,
    upTo,
    team1StartGameScore,
    team2StartGameScore,
    competitionDescription,
    ...playerNames
  } = props.options;
  const umpire = new Umpire(
    {
      clearBy2,
      numServes,
      upTo,
      team1StartGameScore,
      team2StartGameScore,
    },
    isDoubles,
    bestOf,
  );

  return (
    <div>
      <Typography variant="h5">{competitionDescription}</Typography>
      <UmpireController umpire={umpire} {...playerNames} />
    </div>
  );
}
