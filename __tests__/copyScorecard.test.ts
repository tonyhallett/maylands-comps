import {
  createUmpire,
  getFullGameScores,
} from "../src/teamMatches/league/helpers";
import { getConcededScores } from "../src/teamMatches/league/play/league-match-view/scorecardToClipboard/getConcededScores";
import { getTeamForfeitedScores } from "../src/teamMatches/league/play/league-match-view/scorecardToClipboard/getTeamForfeitedScores";
import { Score } from "../src/teamMatches/league/scorecardToClipboard/drawTable";
import { Umpire } from "../src/umpire";
import { scoreGameScores, scorePoints } from "../src/umpire/umpireHelpers";

describe("getConcededScores", () => {
  let umpire: Umpire;
  beforeEach(() => {
    umpire = createUmpire(false);
  });

  function expectScores(expectedScores: Score[], homeConcede: boolean) {
    const gameScores = getFullGameScores(umpire.getMatchState());
    const concededScores = getConcededScores(gameScores, homeConcede);
    expect(concededScores).toEqual<Score[]>(expectedScores);
  }

  it("should work for away conceded and no points played", () => {
    expectScores(
      [
        {
          home: 11,
          away: 0,
        },
        {
          home: 11,
          away: 0,
        },
        {
          home: 11,
          away: 0,
        },
      ],
      false,
    );
  });

  it("should work for home conceded and no points played", () => {
    expectScores(
      [
        {
          home: 0,
          away: 11,
        },
        {
          home: 0,
          away: 11,
        },
        {
          home: 0,
          away: 11,
        },
      ],
      true,
    );
  });

  it("should work mid game - 7-2 => 11-2", () => {
    scorePoints(umpire, true, 7);
    scorePoints(umpire, false, 2);
    expectScores(
      [
        {
          home: 11,
          away: 2,
        },
        {
          home: 11,
          away: 0,
        },
        {
          home: 11,
          away: 0,
        },
      ],
      false,
    );
  });

  it("should work mid game - 10-10 => 12-10", () => {
    scorePoints(umpire, true, 10);
    scorePoints(umpire, false, 10);
    expectScores(
      [
        {
          home: 12,
          away: 10,
        },
        {
          home: 11,
          away: 0,
        },
        {
          home: 11,
          away: 0,
        },
      ],
      false,
    );
  });

  it("should work mid game - 13-14 => 13-15", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 13,
        team2Points: 14,
      },
    ]);
    expectScores(
      [
        {
          home: 13,
          away: 15,
        },
        {
          home: 0,
          away: 11,
        },
        {
          home: 0,
          away: 11,
        },
      ],
      true,
    );
  });

  it("should work when a game has been won by the non conceding team", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 11,
        team2Points: 5,
      },
    ]);
    expectScores(
      [
        {
          home: 11,
          away: 5,
        },
        {
          home: 11,
          away: 0,
        },
        {
          home: 11,
          away: 0,
        },
      ],
      false,
    );
  });

  it("should work when a game has been won by the conceding team", () => {
    scoreGameScores(umpire, [
      {
        team1Points: 11,
        team2Points: 5,
      },
    ]);
    expectScores(
      [
        {
          home: 11,
          away: 5,
        },
        {
          home: 0,
          away: 11,
        },
        {
          home: 0,
          away: 11,
        },
        {
          home: 0,
          away: 11,
        },
      ],
      true,
    );
  });
});

describe("getTeamForfeitedScores", () => {
  it("should work when home team forfeit", () => {
    expect(getTeamForfeitedScores(true)).toEqual<Score[]>([
      { home: 0, away: 11 },
      { home: 0, away: 11 },
      { home: 0, away: 11 },
    ]);
  });
  it("should work when away team forfeit", () => {
    expect(getTeamForfeitedScores(false)).toEqual<Score[]>([
      { home: 11, away: 0 },
      { home: 11, away: 0 },
      { home: 11, away: 0 },
    ]);
  });
});

describe("getScorecardGames", () => {
  //todo
});
