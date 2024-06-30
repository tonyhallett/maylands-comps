import { FreeScoringPlayer } from "./FreeScoringPlayer";

export interface FreeScoringTeam {
  player1: FreeScoringPlayer;
  player2: FreeScoringPlayer;
  handicap: number;
  id: number;
}
