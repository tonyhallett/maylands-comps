import { getGameStats, GamePointHistory } from "../src/matchstats";
import { PointHistory, PointState, Umpire } from "../src/umpire";
import {
  LeadInfo,
  LeadsStats,
  LeadStatistician,
} from "../src/matchstats/LeadStatistician";
import {
  AvailableGameMatchPoints,
  availableGameMatchPoints,
  GameMatchPointDeucesStatistician,
  GameMatchPointDeucesStats,
  GameMatchPointSaved,
  gameMatchPointsSaved,
  GameMatchPointState,
  SavedPoint,
} from "../src/matchstats/GameMatchPointDeucesStatistician";
import {
  PlayerPointsBreakdown,
  PointsBreakdownStats,
  ServeOrReceiveRecord,
  TeamPointsBreakdown,
} from "../src/matchstats/PointsBreakdownStatistician";
import { expect } from "../customMatchers/extendedExpect";
import {
  isGamePoint,
  team1WonGameOrMatch,
} from "../src/umpire/pointStateHelpers";
import { getLast } from "../src/helpers/getLast";

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
      (team1WonPoint) => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: team1WonPoint ? 1 : 0,
            team2Points: team1WonPoint ? 0 : 1,
          },
        ];
        const stats = getGameStats(gamePointHistory);
        const scoringTeamStreaks = team1WonPoint
          ? stats.streaks.team1
          : stats.streaks.team2;
        const nonScoringTeamStreaks = team1WonPoint
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
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
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
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 4,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 5,
          team2Points: 1,
        },
      ];
      const stats = getGameStats(gamePointHistory);
      expect(stats.streaks.team1.streaks).toEqual([2, 3]);
      expect(stats.streaks.team1.longestStreak).toEqual(3);
      expect(stats.streaks.team2.streaks).toEqual([1]);
      expect(stats.streaks.team2.longestStreak).toEqual(1);
    });
  });

  describe("gameMatchPoints", () => {
    describe("numDeuces", () => {
      it("should be 0 when no PointState.Deuce", () => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 0,
            team1Points: 1,
            team2Points: 0,
          },
        ];
        const numDeuces =
          getGameStats(gamePointHistory).gameMatchPoints!.numDeuces;

        expect(numDeuces).toBe(0);
      });
      it("should be 1 when encounter PointState.Deuce", () => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 0,
            team1Points: 1,
            team2Points: 0,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.Deuce,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 1,
            team2Points: 1,
          },
        ];
        const numDeuces =
          getGameStats(gamePointHistory).gameMatchPoints!.numDeuces;

        expect(numDeuces).toBe(1);
      });

      it("should be 2 when when encounter 2 PointState.Deuce", () => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 0,
            team1Points: 1,
            team2Points: 0,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.Deuce,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 1,
            team2Points: 1,
          },
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 2,
            team2Points: 1,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.Deuce,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 0,
            team1Points: 2,
            team2Points: 2,
          },
        ];
        const numDeuces =
          getGameStats(gamePointHistory).gameMatchPoints!.numDeuces;

        expect(numDeuces).toBe(2);
      });
    });
    it("should be undefined when there has been no game or match points", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
      ];
      const stats = getGameStats(gamePointHistory);
      expect(stats.gameMatchPoints).toBeUndefined();
    });
    describe("savedPointsAt", () => {
      it("should be empty when no saved game or match points", () => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2,
            team1Points: 1,
            team2Points: 0,
          },
        ];
        const savedPointsAt =
          getGameStats(gamePointHistory).gameMatchPoints!.savedPointsAt;

        expect(savedPointsAt).toHaveLength(0);
      });

      it.each([true, false])(
        "should have saved game point when game point is saved",
        (isGamePoint) => {
          const gameOrMatchPointState = isGamePoint
            ? PointState.GamePointTeam1
            : PointState.MatchPointTeam1;
          const gamePointHistory: GamePointHistory = [
            {
              date: new Date(),
              team1WonPoint: true,
              pointState: gameOrMatchPointState,
              server: "Team1Player1",
              receiver: "Team2Player1",
              gameOrMatchPoints: 2,
              team1Points: 1,
              team2Points: 0,
            },
            {
              date: new Date(),
              team1WonPoint: false,
              pointState: gameOrMatchPointState,
              server: "Team1Player1",
              receiver: "Team2Player1",
              gameOrMatchPoints: 1,
              team1Points: 1,
              team2Points: 1,
            },
          ];
          const savedPointsAt =
            getGameStats(gamePointHistory).gameMatchPoints!.savedPointsAt;

          expect(savedPointsAt).toEqual<SavedPoint[]>([
            {
              at: 2,
              isGamePoint,
            },
          ]);
        },
      );
    });
    interface EnterGamePointTest {
      pointState:
        | PointState.GamePointTeam1
        | PointState.GamePointTeam2
        | PointState.MatchPointTeam1
        | PointState.MatchPointTeam2;
      gameOrMatchPoints: number;
    }
    const enterGamePointTests: EnterGamePointTest[] = [
      {
        gameOrMatchPoints: 2,
        pointState: PointState.GamePointTeam1,
      },
      {
        gameOrMatchPoints: 3,
        pointState: PointState.GamePointTeam2,
      },
      {
        gameOrMatchPoints: 2,
        pointState: PointState.MatchPointTeam1,
      },
      {
        gameOrMatchPoints: 3,
        pointState: PointState.MatchPointTeam2,
      },
    ];
    it.each(enterGamePointTests)(
      "should have GameOrMatchPoints when enter game point state",
      ({ gameOrMatchPoints, pointState }) => {
        const team1WonPoint =
          pointState === PointState.GamePointTeam1 ||
          pointState === PointState.MatchPointTeam1;
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 0,
          },
          {
            date: new Date(),
            team1WonPoint: team1WonPoint,
            pointState,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints,
            team1Points: team1WonPoint ? 2 : 1,
            team2Points: team1WonPoint ? 0 : 1,
          },
        ];
        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPointDeucesStats;
        const gameMatchPointsTeam = team1WonPoint
          ? gameMatchPoints.team1
          : gameMatchPoints.team2;

        expect(gameMatchPointsTeam!).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: gameOrMatchPoints,
            pointNumber: 2,
            isGamePoint: isGamePoint(pointState),
          },
        ]);
        const nonGameMatchPointsTeam = team1WonPoint
          ? gameMatchPoints.team2
          : gameMatchPoints.team1;
        expect(nonGameMatchPointsTeam).toHaveLength(0);
      },
    );
    it("should increment points saved when point is saved but still game point", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 2,
          team2Points: 0,
        },
      ];
      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 1,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 2,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 0,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
      ]);
    });

    it("should work with multiple saved points", () => {
      const umpire = new Umpire(
        {
          bestOf: 3,
          clearBy2: true,
          upTo: 3,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
        },
        false,
      );

      umpire.pointScored(true); // 1-0
      umpire.pointScored(true); // 2-0 - game point
      umpire.pointScored(false); // 2-1 - saved game point
      umpire.pointScored(false); // 2-2 - saved game point
      umpire.pointScored(true); // 3-2 - game point
      umpire.pointScored(false); //3-3 - saved game point
      umpire.pointScored(false); //3-4 - game point
      const matchState = umpire.pointScored(true); //4-4 saved game point
      const gamePointHistory = matchState.pointHistory[0];
      const gameMatchPointStatistician = new GameMatchPointDeucesStatistician();
      gamePointHistory.forEach((pointHistory) =>
        gameMatchPointStatistician.nextPoint(pointHistory),
      );
      const stats = gameMatchPointStatistician.getStats()!;
      const expected = [3, 4, 6, 8].map<SavedPoint>((at) => ({
        at,
        isGamePoint: true,
      }));
      expect(stats.savedPointsAt).toEqual<SavedPoint[]>(expected);
    });

    it("should set converted to true when match point is converted - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.MatchPointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.MatchPointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Team1Won,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: true,
          pointsSaved: 1,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: false,
        },
      ]);
    });

    it("should set converted to true when game point is converted - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 0,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GameWonTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 2,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
        {
          converted: true,
          pointsSaved: 1,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
      ]);
    });

    it("should create a new gameMatchPointState when a new game point is entered", () => {
      const gamePointHistory: GamePointHistory = [
        // enter game point for Team1
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        // game point saved by Team2
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        // game point saved by Team2
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        // enter game point for Team1
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 3,
          team2Points: 1,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 2,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
        {
          converted: false,
          pointsSaved: 0,
          numGameMatchPoints: 2,
          pointNumber: 4,
          isGamePoint: true,
        },
      ]);
    });

    it("should be able to save and enter", () => {
      // will need to do combinations of game point with match point

      const gamePointHistory: GamePointHistory = [
        // not clear by 2

        // enter game point for Team1
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 10,
          team2Points: 9,
        },
        // game point saved by Team2 and enter game point for Team2
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.GamePointTeam1 + PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 10,
          team2Points: 10,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPointDeucesStats;

      expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 1,
          numGameMatchPoints: 2,
          pointNumber: 1,
          isGamePoint: true,
        },
      ]);
      expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
        {
          converted: false,
          pointsSaved: 0,
          numGameMatchPoints: 1,
          pointNumber: 2,
          isGamePoint: true,
        },
      ]);
    });

    describe("two teams in game point state", () => {
      it("should have states for both teams.  First team will have a point saved - Team1", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 10,
            team2Points: 9,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.GamePointTeam1 + PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 10,
            team2Points: 10,
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPointDeucesStats;

        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 2,
            pointNumber: 1,
            isGamePoint: true,
          },
        ]);
        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: 1,
            pointNumber: 2,
            isGamePoint: true,
          },
        ]);
      });
      it("should have states for both teams.  First team will have a point saved - Team2", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 9,
            team2Points: 10,
          },
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1 + PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 10,
            team2Points: 10,
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPointDeucesStats;

        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 2,
            pointNumber: 1,
            isGamePoint: true,
          },
        ]);
        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 0,
            numGameMatchPoints: 1,
            pointNumber: 2,
            isGamePoint: true,
          },
        ]);
      });
      it("should convert and pointSaved", () => {
        // e.g up to 11 clear by 1
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 10,
            team2Points: 9,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.GamePointTeam1 + PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 10,
            team2Points: 10,
          },
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.Team1Won,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 11,
            team2Points: 10,
          },
        ];

        const gameMatchPoints = getGameStats(gamePointHistory)
          .gameMatchPoints as GameMatchPointDeucesStats;

        expect(gameMatchPoints.team1).toEqual<GameMatchPointState[]>([
          {
            converted: true,
            pointsSaved: 1,
            numGameMatchPoints: 2,
            pointNumber: 1,
            isGamePoint: true,
          },
        ]);
        expect(gameMatchPoints.team2).toEqual<GameMatchPointState[]>([
          {
            converted: false,
            pointsSaved: 1,
            numGameMatchPoints: 1,
            pointNumber: 2,
            isGamePoint: true,
          },
        ]);
      });
    });

    describe("availableGameMatchPoints", () => {
      function expectAvailableGameMatchPoints(
        expected: AvailableGameMatchPoints | undefined,
        scorePoints: (umpire: Umpire) => void,
        clearBy2 = true,
        upTo = 11,
        team1 = true,
      ) {
        const umpire = new Umpire(
          {
            bestOf: 3,
            clearBy2,
            numServes: 2,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            upTo,
          },
          false,
        );
        scorePoints(umpire);
        const gamePointHistory = getLast(
          umpire.getMatchState().pointHistory as PointHistory[][],
        );

        const statistician = new GameMatchPointDeucesStatistician();
        gamePointHistory.forEach((pointHistory) => {
          statistician.nextPoint(pointHistory);
        });
        const stats = statistician.getStats()!;
        const team = team1 ? stats.team1 : stats.team2;
        expect(availableGameMatchPoints(team)).toEqual(expected);
      }

      it.each([3, 5])(
        "should have numGameMatchPoints when enter game point state",
        (upTo) => {
          expectAvailableGameMatchPoints(
            {
              available: upTo - 1,
              isGamePoint: true,
            },
            (umpire) => {
              for (let i = 0; i < upTo - 1; i++) {
                umpire.pointScored(true);
              }
            },
            true,
            upTo,
          );
        },
      );

      it("should be undefined when no game match point states", () => {
        expectAvailableGameMatchPoints(
          undefined,
          (umpire) => {
            umpire.pointScored(true);
          },
          true,
          2,
          false,
        );
      });

      it("should be undefined if converted", () => {
        expect(
          availableGameMatchPoints([
            {
              converted: true,
              isGamePoint: true,
              numGameMatchPoints: 3,
              pointsSaved: 2,
              pointNumber: 1,
            },
          ]),
        ).toBeUndefined();
      });

      it.each([true, false])("should be the remaining", (isGamePoint) => {
        expect(
          availableGameMatchPoints([
            {
              pointNumber: 1,
              converted: false,
              isGamePoint,
              numGameMatchPoints: 1,
              pointsSaved: 1,
            },
            {
              converted: false,
              isGamePoint,
              numGameMatchPoints: 7,
              pointsSaved: 3,
              pointNumber: 2,
            },
          ]),
        ).toEqual<AvailableGameMatchPoints>({
          available: 4,
          isGamePoint,
        });
      });

      it("should be undefined if none remaining", () => {
        expect(
          availableGameMatchPoints([
            {
              pointNumber: 1,
              converted: false,
              isGamePoint: true,
              numGameMatchPoints: 3,
              pointsSaved: 3,
            },
          ]),
        ).toBeUndefined();
      });
    });

    describe("gameMatchPointsSaved", () => {
      it("should be undefined if no game match points", () => {
        expect(gameMatchPointsSaved([])).toBeUndefined();
      });
      it("should work with single GameMatchPointState", () => {
        const result = gameMatchPointsSaved([
          {
            converted: false,
            isGamePoint: true,
            numGameMatchPoints: 2,
            pointsSaved: 1,
            pointNumber: 1,
          },
        ]);
        expect(result).toEqual<GameMatchPointSaved>({
          numPoints: 2,
          numSaved: 1,
          isGamePoints: true,
        });
      });

      it("should work with multiple GameMatchPointState", () => {
        const result = gameMatchPointsSaved([
          {
            converted: false,
            isGamePoint: false,
            numGameMatchPoints: 2,
            pointsSaved: 2,
            pointNumber: 2,
          },
          {
            converted: false,
            isGamePoint: false,
            numGameMatchPoints: 1,
            pointsSaved: 0,
            pointNumber: 4,
          },
        ]);
        expect(result).toEqual<GameMatchPointSaved>({
          numPoints: 3,
          numSaved: 2,
          isGamePoints: false,
        });
      });
    });
  });

  describe("leads", () => {
    const getStats = (...pointHistory: PointHistory[]): LeadsStats => {
      const leadStats2 = new LeadStatistician();
      pointHistory.forEach((point) => leadStats2.nextPoint(point));
      return leadStats2.getStats();
    };

    it("should have no leads when no points scored", () => {
      expect(getStats()).toStrictEqual<LeadsStats>({
        team1: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
        },
        numChanges: 0,
      });
    });

    it.each([true, false])(
      "should have single lead when first point scored",
      (team1WonPoint) => {
        const leadInfo: LeadInfo = {
          fromPoint: 1,
          biggestLead: 1,
          leadingFor: 1,
        };
        const leadStats = getStats({
          date: new Date(),
          team1WonPoint: team1WonPoint,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: team1WonPoint ? 1 : 0,
          team2Points: !team1WonPoint ? 1 : 0,
        });
        expect(leadStats).toStrictEqual<LeadsStats>({
          team1: {
            leads: team1WonPoint ? [leadInfo] : [],
            biggest: team1WonPoint ? 1 : 0,
            numPointsInLead: team1WonPoint ? 1 : 0,
            percentageOfGameInLead: team1WonPoint ? 100 : 0,
          },
          team2: {
            leads: !team1WonPoint ? [leadInfo] : [],
            biggest: !team1WonPoint ? 1 : 0,
            numPointsInLead: !team1WonPoint ? 1 : 0,
            percentageOfGameInLead: !team1WonPoint ? 100 : 0,
          },
          numChanges: 0,
        });
      },
    );

    it("should increment lead when team scores again when in lead", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
      );

      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 2,
              leadingFor: 2,
            },
          ],
          biggest: 2,
          numPointsInLead: 2,
          percentageOfGameInLead: 100,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
          percentageOfGameInLead: 0,
        },
        numChanges: 0,
      });
    });

    it("should not change leads when go to deuce", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
      );

      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 1,
              leadingFor: 1,
            },
          ],
          biggest: 1,
          numPointsInLead: 1,
          percentageOfGameInLead: 50,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
          percentageOfGameInLead: 0,
        },
        numChanges: 0,
      });
    });

    it("should be able to switch leads", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 2,
        },
      );

      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 1,
              leadingFor: 1,
            },
          ],
          numPointsInLead: 1,
          percentageOfGameInLead: (1 / 3) * 100,
          biggest: 1,
        },
        team2: {
          leads: [
            {
              fromPoint: 3,
              biggestLead: 1,
              leadingFor: 1,
            },
          ],
          biggest: 1,
          numPointsInLead: 1,
          percentageOfGameInLead: (1 / 3) * 100,
        },
        numChanges: 1,
      });
    });

    it("should start a new lead when team scores after deuce", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
      );

      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 1,
              leadingFor: 1,
            },
            {
              fromPoint: 3,
              biggestLead: 1,
              leadingFor: 1,
            },
          ],
          biggest: 1,
          numPointsInLead: 2,
          percentageOfGameInLead: (2 / 3) * 100,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
          percentageOfGameInLead: 0,
        },
        numChanges: 1,
      });
    });

    it("should increase the biggest lead if the current lead is greater than existing biggest lead", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 4,
          team2Points: 1,
        },
      );
      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 3,
              leadingFor: 5,
            },
          ],
          biggest: 3,
          numPointsInLead: 5,
          percentageOfGameInLead: 100,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
          percentageOfGameInLead: 0,
        },
        numChanges: 0,
      });
    });

    it("should calculate the biggest lead correctly when multiple leads", () => {
      const leadStats = getStats(
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
      );
      expect(leadStats).toStrictEqual<LeadsStats>({
        team1: {
          leads: [
            {
              fromPoint: 1,
              biggestLead: 1,
              leadingFor: 1,
            },
            {
              fromPoint: 3,
              biggestLead: 2,
              leadingFor: 2,
            },
          ],
          numPointsInLead: 3,
          percentageOfGameInLead: 75,
          biggest: 2,
        },
        team2: {
          leads: [],
          biggest: 0,
          numPointsInLead: 0,
          percentageOfGameInLead: 0,
        },
        numChanges: 1,
      });
    });

    const winningPointStates: PointState[] = [
      PointState.Team1Won,
      PointState.Team2Won,
      PointState.GameWonTeam1,
      PointState.GameWonTeam2,
    ];
    it.each(winningPointStates)(
      "should have greatest deficit overcome as the biggest lead of the other team",
      (winningPointState) => {
        const team1Won = team1WonGameOrMatch(winningPointState);
        const leadStats = getStats(
          {
            date: new Date(),
            team1WonPoint: true,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 0,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 1,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: PointState.Default,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 2,
          },
          {
            date: new Date(),
            team1WonPoint: false,
            pointState: winningPointState,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 3,
          },
        );
        const expectedLeads: LeadsStats = {
          team1: {
            leads: [
              {
                fromPoint: 1,
                biggestLead: 1,
                leadingFor: 1,
              },
            ],
            biggest: 1,
            numPointsInLead: 1,
            percentageOfGameInLead: 25,
          },
          team2: {
            leads: [
              {
                fromPoint: 3,
                biggestLead: 2,
                leadingFor: 2,
              },
            ],
            biggest: 2,
            numPointsInLead: 2,
            percentageOfGameInLead: 50,
          },
          numChanges: 1,
        };
        if (team1Won) {
          expectedLeads.team1.greatestDeficitOvercome = 2;
        } else {
          expectedLeads.team2.greatestDeficitOvercome = 1;
        }
        expect(leadStats).toStrictEqual<LeadsStats>(expectedLeads);
      },
    );
  });

  describe("pointsbreakdown", () => {
    it("should be correct when no game points", () => {
      const gamePointHistory: GamePointHistory = [];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;

      const expectedServeReceiveRecord: ServeOrReceiveRecord = {
        num: 0,
        numLost: 0,
        numWon: 0,
        winPercentage: undefined,
      };
      const expectedPlayerPointsBreakdown: PlayerPointsBreakdown = {
        receiverRecords: [],
        serverRecords: [],
        receive: expectedServeReceiveRecord,
        serve: expectedServeReceiveRecord,
      };
      const expectedTeamsBreakdown: TeamPointsBreakdown = {
        pointsLost: 0,
        pointsWon: 0,
        pointWinPercentage: undefined,
        receive: expectedServeReceiveRecord,
        serve: expectedServeReceiveRecord,
        player1PointsBreakdown: expectedPlayerPointsBreakdown,
        player2PointsBreakdown: expectedPlayerPointsBreakdown,
      };
      const expectedPointsBreakdown: PointsBreakdownStats = {
        team1: expectedTeamsBreakdown,
        team2: expectedTeamsBreakdown,
      };
      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });
    const player2NotPlayingPointsBreakdown: PlayerPointsBreakdown = {
      receiverRecords: [],
      serverRecords: [],
      receive: {
        num: 0,
        numLost: 0,
        numWon: 0,
        winPercentage: undefined,
      },
      serve: {
        num: 0,
        numLost: 0,
        numWon: 0,
        winPercentage: undefined,
      },
    };

    it.each([true, false])(
      "should be correct when 1 game point - server wins point %p",
      (team1Server) => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            pointState: PointState.Default,
            server: team1Server ? "Team1Player1" : "Team2Player1",
            receiver: !team1Server ? "Team1Player1" : "Team2Player1",
            team1WonPoint: team1Server,
            team1Points: team1Server ? 1 : 0,
            team2Points: !team1Server ? 1 : 0,
          },
        ];
        const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;
        const serverTeamPointsBreakdown: TeamPointsBreakdown = {
          pointsWon: 1,
          pointsLost: 0,
          pointWinPercentage: 100,
          serve: {
            num: 1,
            numLost: 0,
            numWon: 1,
            winPercentage: 100,
          },
          receive: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
          player1PointsBreakdown: {
            receiverRecords: [],
            serverRecords: [
              {
                num: 1,
                numWon: 1,
                numLost: 0,
                winPercentage: 100,
                opponent: team1Server ? "Team2Player1" : "Team1Player1",
              },
            ],
            receive: {
              num: 0,
              numLost: 0,
              numWon: 0,
              winPercentage: undefined,
            },
            serve: {
              num: 1,
              numLost: 0,
              numWon: 1,
              winPercentage: 100,
            },
          },
          player2PointsBreakdown: player2NotPlayingPointsBreakdown,
        };
        const receiverTeamPointsBreakdown: TeamPointsBreakdown = {
          pointsWon: 0,
          pointsLost: 1,
          pointWinPercentage: 0,
          serve: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
          receive: {
            num: 1,
            numLost: 1,
            numWon: 0,
            winPercentage: 0,
          },
          player1PointsBreakdown: {
            receiverRecords: [
              {
                num: 1,
                numWon: 0,
                numLost: 1,
                winPercentage: 0,
                opponent: team1Server ? "Team1Player1" : "Team2Player1",
              },
            ],
            serverRecords: [],
            receive: {
              num: 1,
              numLost: 1,
              numWon: 0,
              winPercentage: 0,
            },
            serve: {
              num: 0,
              numLost: 0,
              numWon: 0,
              winPercentage: undefined,
            },
          },
          player2PointsBreakdown: player2NotPlayingPointsBreakdown,
        };
        const expectedPointsBreakdown: PointsBreakdownStats = {
          team1: team1Server
            ? serverTeamPointsBreakdown
            : receiverTeamPointsBreakdown,
          team2: !team1Server
            ? serverTeamPointsBreakdown
            : receiverTeamPointsBreakdown,
        };

        expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
      },
    );

    it("should be correct when 1 game point each", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 1,
        },
      ];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;
      const team1TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 1,
        pointsLost: 1,
        pointWinPercentage: 50,
        serve: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        receive: {
          num: 0,
          numLost: 0,
          numWon: 0,
          winPercentage: undefined,
        },
        player1PointsBreakdown: {
          receiverRecords: [],
          serverRecords: [
            {
              num: 2,
              numWon: 1,
              numLost: 1,
              winPercentage: 50,
              opponent: "Team2Player1",
            },
          ],
          receive: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
          serve: {
            num: 2,
            numLost: 1,
            numWon: 1,
            winPercentage: 50,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const team2TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 1,
        pointsLost: 1,
        pointWinPercentage: 50,
        serve: {
          num: 0,
          numLost: 0,
          numWon: 0,
          winPercentage: undefined,
        },
        receive: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 2,
              numWon: 1,
              numLost: 1,
              winPercentage: 50,
              opponent: "Team1Player1",
            },
          ],
          serverRecords: [],
          receive: {
            num: 2,
            numLost: 1,
            numWon: 1,
            winPercentage: 50,
          },
          serve: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const expectedPointsBreakdown: PointsBreakdownStats = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });

    it("should be correct when 2 game points", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 2,
          team2Points: 0,
        },
      ];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;
      const team1TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 2,
        pointsLost: 0,
        pointWinPercentage: 100,
        serve: {
          num: 2,
          numLost: 0,
          numWon: 2,
          winPercentage: 100,
        },
        receive: {
          num: 0,
          numLost: 0,
          numWon: 0,
          winPercentage: undefined,
        },
        player1PointsBreakdown: {
          receiverRecords: [],
          serverRecords: [
            {
              num: 2,
              numWon: 2,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team2Player1",
            },
          ],
          receive: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
          serve: {
            num: 2,
            numLost: 0,
            numWon: 2,
            winPercentage: 100,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const team2TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 0,
        pointsLost: 2,
        pointWinPercentage: 0,
        serve: {
          num: 0,
          numLost: 0,
          numWon: 0,
          winPercentage: undefined,
        },
        receive: {
          num: 2,
          numLost: 2,
          numWon: 0,
          winPercentage: 0,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 2,
              numWon: 0,
              numLost: 2,
              winPercentage: 0,
              opponent: "Team1Player1",
            },
          ],
          serverRecords: [],
          receive: {
            num: 2,
            numLost: 2,
            numWon: 0,
            winPercentage: 0,
          },
          serve: {
            num: 0,
            numLost: 0,
            numWon: 0,
            winPercentage: undefined,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const expectedPointsBreakdown: PointsBreakdownStats = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });
    it("should be correct with multiple services", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team2Player1",
          receiver: "Team1Player1",
          team1WonPoint: true,
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team2Player1",
          receiver: "Team1Player1",
          team1WonPoint: false,
          team1Points: 2,
          team2Points: 2,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 3,
          team2Points: 2,
        },
      ];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;
      const team1TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 3,
        pointsLost: 2,
        pointWinPercentage: (3 / 5) * 100,
        serve: {
          num: 3,
          numLost: 1,
          numWon: 2,
          winPercentage: (2 / 3) * 100,
        },
        receive: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 2,
              numWon: 1,
              numLost: 1,
              winPercentage: 50,
              opponent: "Team2Player1",
            },
          ],
          serverRecords: [
            {
              num: 3,
              numWon: 2,
              numLost: 1,
              winPercentage: (2 / 3) * 100,
              opponent: "Team2Player1",
            },
          ],
          receive: {
            num: 2,
            numLost: 1,
            numWon: 1,
            winPercentage: 50,
          },
          serve: {
            num: 3,
            numLost: 1,
            numWon: 2,
            winPercentage: (2 / 3) * 100,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const team2TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 2,
        pointsLost: 3,
        pointWinPercentage: (2 / 5) * 100,
        serve: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        receive: {
          num: 3,
          numLost: 2,
          numWon: 1,
          winPercentage: (1 / 3) * 100,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 3,
              numWon: 1,
              numLost: 2,
              winPercentage: (1 / 3) * 100,
              opponent: "Team1Player1",
            },
          ],
          serverRecords: [
            {
              num: 2,
              numWon: 1,
              numLost: 1,
              winPercentage: 50,
              opponent: "Team1Player1",
            },
          ],
          receive: {
            num: 3,
            numLost: 2,
            numWon: 1,
            winPercentage: (1 / 3) * 100,
          },
          serve: {
            num: 2,
            numLost: 1,
            numWon: 1,
            winPercentage: 50,
          },
        },
        player2PointsBreakdown: player2NotPlayingPointsBreakdown,
      };
      const expectedPointsBreakdown: PointsBreakdownStats = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });

    it("should work with doubles", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team2Player1",
          receiver: "Team1Player2",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player2",
          receiver: "Team2Player2",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 2,
        },
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team2Player2",
          receiver: "Team1Player1",
          team1WonPoint: true,
          team1Points: 2,
          team2Points: 2,
        },
        // switching receivers
        {
          date: new Date(),
          pointState: PointState.Default,
          server: "Team1Player1",
          receiver: "Team2Player2",
          team1WonPoint: true,
          team1Points: 3,
          team2Points: 2,
        },
      ];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;
      const team1TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 3,
        pointsLost: 2,
        pointWinPercentage: (3 / 5) * 100,
        serve: {
          num: 3,
          numLost: 1,
          numWon: 2,
          winPercentage: (2 / 3) * 100,
        },
        receive: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 1,
              numWon: 1,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team2Player2",
            },
          ],
          serverRecords: [
            {
              num: 1,
              numWon: 1,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team2Player1",
            },
            {
              num: 1,
              numWon: 1,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team2Player2",
            },
          ],
          receive: {
            num: 1,
            numLost: 0,
            numWon: 1,
            winPercentage: 100,
          },
          serve: {
            num: 2,
            numLost: 0,
            numWon: 2,
            winPercentage: 100,
          },
        },
        player2PointsBreakdown: {
          receiverRecords: [
            {
              num: 1,
              numWon: 0,
              numLost: 1,
              winPercentage: 0,
              opponent: "Team2Player1",
            },
          ],
          serverRecords: [
            {
              num: 1,
              numWon: 0,
              numLost: 1,
              winPercentage: 0,
              opponent: "Team2Player2",
            },
          ],
          receive: {
            num: 1,
            numLost: 1,
            numWon: 0,
            winPercentage: 0,
          },
          serve: {
            num: 1,
            numLost: 1,
            numWon: 0,
            winPercentage: 0,
          },
        },
      };
      const team2TeamPointsBreakdown: TeamPointsBreakdown = {
        pointsWon: 2,
        pointsLost: 3,
        pointWinPercentage: (2 / 5) * 100,
        serve: {
          num: 2,
          numLost: 1,
          numWon: 1,
          winPercentage: 50,
        },
        receive: {
          num: 3,
          numLost: 2,
          numWon: 1,
          winPercentage: (1 / 3) * 100,
        },
        player1PointsBreakdown: {
          receiverRecords: [
            {
              num: 1,
              numWon: 0,
              numLost: 1,
              winPercentage: 0,
              opponent: "Team1Player1",
            },
          ],
          serverRecords: [
            {
              num: 1,
              numWon: 1,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team1Player2",
            },
          ],
          receive: {
            num: 1,
            numLost: 1,
            numWon: 0,
            winPercentage: 0,
          },
          serve: {
            num: 1,
            numLost: 0,
            numWon: 1,
            winPercentage: 100,
          },
        },
        player2PointsBreakdown: {
          receiverRecords: [
            {
              num: 1,
              numWon: 1,
              numLost: 0,
              winPercentage: 100,
              opponent: "Team1Player2",
            },
            {
              num: 1,
              numWon: 0,
              numLost: 1,
              winPercentage: 0,
              opponent: "Team1Player1",
            },
          ],
          serverRecords: [
            {
              num: 1,
              numWon: 0,
              numLost: 1,
              winPercentage: 0,
              opponent: "Team1Player1",
            },
          ],
          receive: {
            num: 2,
            numLost: 1,
            numWon: 1,
            winPercentage: 50,
          },
          serve: {
            num: 1,
            numLost: 1,
            numWon: 0,
            winPercentage: 0,
          },
        },
      };
      const expectedPointsBreakdown: PointsBreakdownStats = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });
  });
});
