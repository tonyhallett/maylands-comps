export interface FreeScoringTeam {
  player1: FreeScoringPlayer;
  player2: FreeScoringPlayer;
  handicap: number;
  id: number;
}

export interface FreeScoringPlayer {
  id: number;
  name: string;
  handicap: number;
}
