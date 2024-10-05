import { Umpire } from "../../../umpire";

export const createLeagueMatchUmpire = (isDoubles: boolean) => {
  return new Umpire(
    {
      bestOf: 5,
      clearBy2: true,
      numServes: 2,
      team1StartGameScore: 0,
      team2StartGameScore: 0,
      upTo: 11,
    },
    isDoubles,
  );
};
