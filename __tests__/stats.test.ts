import {
  getGameStats,
  GamePointHistory,
  GameMatchPoints,
  GameMatchPointState,
} from "../src/matchstats";
import { MatchWinState } from "../src/umpire/getMatchWinState";
describe("getGameStats", () => {
  describe("streaks", () => {
    it("should have no streaks when no points", () => {
      const gamePointHistory: GamePointHistory = [];
      const stats = getGameStats(gamePointHistory);
      expect(stats.streaks.team1.streaks).toEqual([]);
      expect(stats.streaks.team1.longestStreak).toEqual(0);
      expect(stats.streaks.team2.streaks).toEqual([]);
      expect(stats.streaks.team2.longestStreak).toEqual(0);
    });
    it.each([true, false])(
      "should have a streak of 1 when 1 point",
      (team1) => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1,
            matchState: MatchWinState.NotWon,
            server: "Team1Player1",
            receiver: "Team2Player1",
          },
        ];
        const stats = getGameStats(gamePointHistory);
        const scoringTeamStreaks = team1
          ? stats.streaks.team1
          : stats.streaks.team2;
        const nonScoringTeamStreaks = team1
          ? stats.streaks.team2
          : stats.streaks.team1;
        expect(scoringTeamStreaks.streaks).toEqual([1]);
        expect(scoringTeamStreaks.longestStreak).toEqual(1);
        expect(nonScoringTeamStreaks.streaks).toEqual([]);
        expect(nonScoringTeamStreaks.longestStreak).toEqual(0);
      },
    );
    it("should have a streak of 2 when 2 consecutive points won by the same team", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];
      const stats = getGameStats(gamePointHistory);
      const scoringTeamStreaks = stats.streaks.team1;
      expect(scoringTeamStreaks.streaks).toEqual([2]);
      expect(scoringTeamStreaks.longestStreak).toEqual(2);
    });
    it("should start new streaks", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];
      const stats = getGameStats(gamePointHistory);
      expect(stats.streaks.team1.streaks).toEqual([2, 3]);
      expect(stats.streaks.team1.longestStreak).toEqual(3);
      expect(stats.streaks.team2.streaks).toEqual([1]);
      expect(stats.streaks.team2.longestStreak).toEqual(1);
    });
  });

  // might change converted to a converion state - NotConverted, Converted, ConversionMissed
  describe("gameMatchPoints", () => {
    it("should be undefined when there has been no game or match points", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];
      const stats = getGameStats(gamePointHistory);
      expect(stats.gameMatchPoints).toBeUndefined();
    });
    interface EnterGamePointTest {
      matchState:
        | MatchWinState.GamePointTeam1
        | MatchWinState.GamePointTeam2
        | MatchWinState.MatchPointTeam1
        | MatchWinState.MatchPointTeam2;
      gameOrMatchPoints: number;
    }
    const enterGamePointTests: EnterGamePointTest[] = [
      {
        gameOrMatchPoints: 2,
        matchState: MatchWinState.GamePointTeam1,
      },
      {
        gameOrMatchPoints: 3,
        matchState: MatchWinState.GamePointTeam2,
      },
      {
        gameOrMatchPoints: 2,
        matchState: MatchWinState.MatchPointTeam1,
      },
      {
        gameOrMatchPoints: 3,
        matchState: MatchWinState.MatchPointTeam2,
      },
    ];
    it.each(enterGamePointTests)(
      "should have GameOrMatchPoints when enter game point state",
      ({ gameOrMatchPoints, matchState }) => {
        const isMatchPoint =
          matchState === MatchWinState.MatchPointTeam1 ||
          matchState === MatchWinState.MatchPointTeam2;
        const team1 =
          matchState === MatchWinState.GamePointTeam1 ||
          matchState === MatchWinState.MatchPointTeam1;
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1: true,
            matchState: MatchWinState.NotWon,
            server: "Team1Player1",
            receiver: "Team2Player1",
          },
          {
            date: new Date(),
            team1,
            matchState,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints,
          },
        ];
        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPoints;
        expect(gameMatchPoints.isMatchPoint).toBe(isMatchPoint);
        const gameMatchPointsTeam = team1
          ? gameMatchPoints.team1
          : gameMatchPoints.team2;

        expect(gameMatchPointsTeam!).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: gameOrMatchPoints,
          },
        ]);
        const nonGameMatchPointsTeam = team1
          ? gameMatchPoints.team2
          : gameMatchPoints.team1;
        expect(nonGameMatchPointsTeam).toHaveLength(0);
      },
    );
    it("should increment points saved when point is saved but still game point", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
      ];
      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 1,
          numGameMatchPoints: 2,
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
        },
      ]);
    });

    it("should set converted to true when game point is converted - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.Team1Won,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: true,
          pointsSaved: 1,
          numGameMatchPoints: 2,
        },
      ]);
    });

    it("should set converted to true when game point is converted - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.Team2Won,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
        {
          converted: true,
          pointsSaved: 1,
          numGameMatchPoints: 2,
        },
      ]);
    });

    it("should create a new gameMatchPointState when a new game point is entered", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
        {
          date: new Date(),
          team1: false,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
        },
        {
          date: new Date(),
          team1: true,
          matchState: MatchWinState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
        },
        {
          converted: false,
          pointsSaved: 0,
          numGameMatchPoints: 2,
        },
      ]);
    });

    describe("two teams in game point state", () => {
      it("should have states for both teams.  First team will have a point saved - Team1", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1: true,
            matchState: MatchWinState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
          },
          {
            date: new Date(),
            team1: false,
            matchState:
              MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPoints;

        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 2,
          },
        ]);
        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: 1,
          },
        ]);
      });
      it("should have states for both teams.  First team will have a point saved - Team2", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1: false,
            matchState: MatchWinState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
          },
          {
            date: new Date(),
            team1: true,
            matchState:
              MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPoints;

        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 2,
          },
        ]);
        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: 1,
          },
        ]);
      });
      it("should convert and pointSaved", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1: true,
            matchState: MatchWinState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
          },
          {
            date: new Date(),
            team1: false,
            matchState:
              MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
          },
          {
            date: new Date(),
            team1: true,
            matchState: MatchWinState.Team1Won,
            server: "Team1Player1",
            receiver: "Team2Player1",
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPoints;

        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: true,
            pointsSaved: 1,
            numGameMatchPoints: 2,
          },
        ]);
        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 1,
          },
        ]);
      });
    });
  });

  xdescribe("pointsbreakdown", () => {});
});
