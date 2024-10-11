import { GameScore, TeamScore, Umpire } from "../src/umpire";
import { scoreGameScores } from "../src/umpire/umpireHelpers";

describe("scoreGameScores helper", () => {
  let umpire: Umpire;
  beforeEach(() => {
    umpire = new Umpire(
      {
        bestOf: 5,
        clearBy2: true,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        upTo: 11,
      },
      false,
    );
  });
  it("should work when scores less than 10", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 1,
        team2Points: 6,
      },
    ]);
    const matchState = umpire.getMatchState();
    expect(matchState.completedGameScores).toHaveLength(0);
    expect(matchState.team1Score).toEqual<TeamScore>({
      games: 0,
      points: 1,
    });
    expect(matchState.team2Score).toEqual<TeamScore>({
      games: 0,
      points: 6,
    });
  });

  it("should work when game won at 11 points", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 5,
        team2Points: 11,
      },
    ]);
    const matchState = umpire.getMatchState();
    expect(matchState.completedGameScores).toEqual<GameScore[]>([
      {
        team1Points: 5,
        team2Points: 11,
      },
    ]);
    expect(matchState.team1Score).toEqual<TeamScore>({
      games: 0,
      points: 0,
    });
    expect(matchState.team2Score).toEqual<TeamScore>({
      games: 1,
      points: 0,
    });
  });

  it("should work pass deuce", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 13,
        team2Points: 14,
      },
    ]);
    const matchState = umpire.getMatchState();
    expect(matchState.completedGameScores).toHaveLength(0);
    expect(matchState.team1Score).toEqual<TeamScore>({
      games: 0,
      points: 13,
    });
    expect(matchState.team2Score).toEqual<TeamScore>({
      games: 0,
      points: 14,
    });
  });
});
