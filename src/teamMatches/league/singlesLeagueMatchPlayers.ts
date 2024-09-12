interface SinglesLeagueMatchPlayerBase {
  index: 0 | 1 | 2;
}
interface HomeLeagueMatchPlayer extends SinglesLeagueMatchPlayerBase {
  id: "A" | "B" | "C";
}
interface AwayLeagueMatchPlayer extends SinglesLeagueMatchPlayerBase {
  id: "X" | "Y" | "Z";
}
interface SinglesLeagueMatchPlayers {
  home: HomeLeagueMatchPlayer;
  away: AwayLeagueMatchPlayer;
}
const playerA: HomeLeagueMatchPlayer = { index: 0, id: "A" };
const playerB: HomeLeagueMatchPlayer = { index: 1, id: "B" };
const playerC: HomeLeagueMatchPlayer = { index: 2, id: "C" };
const playerX: AwayLeagueMatchPlayer = { index: 0, id: "X" };
const playerY: AwayLeagueMatchPlayer = { index: 1, id: "Y" };
const playerZ: AwayLeagueMatchPlayer = { index: 2, id: "Z" };
export const singlesLeagueMatchPlayers: SinglesLeagueMatchPlayers[] = [
  { home: playerA, away: playerX },
  { home: playerB, away: playerY },
  { home: playerC, away: playerZ },

  { home: playerB, away: playerX },
  { home: playerA, away: playerZ },
  { home: playerC, away: playerY },
  { home: playerB, away: playerZ },
  { home: playerC, away: playerX },
  { home: playerA, away: playerY },
];
