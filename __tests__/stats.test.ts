import { getGameStats, GamePointHistory } from "../src/matchstats";
import { PointHistory, PointState } from "../src/umpire";
import { fillArrayWithIndices } from "../src/helpers/fillArray";
import { TeamLeads } from "../src/matchstats/LeadStats";
import {
  GameMatchPoints,
  GameMatchPointState,
} from "../src/matchstats/GameMatchPointsStats";
import {
  PlayerPointsBreakdown,
  PointsBreakdown,
  ServeReceiveRecord,
  TeamPointsBreakdown,
} from "../src/matchstats/PointsBreakdownStats";
import { expect } from "../customMatchers/extendedExpect";
import { isGamePoint } from "../src/umpire/pointStateHelpers";

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
            pointState: PointState.NotWon,
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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 4,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
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

  // might change converted to a converion state - NotConverted, Converted, ConversionMissed
  describe("gameMatchPoints", () => {
    it("should be undefined when there has been no game or match points", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
      ];
      const stats = getGameStats(gamePointHistory);
      expect(stats.gameMatchPoints).toBeUndefined();
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
            pointState: PointState.NotWon,
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
          .gameMatchPoints as GameMatchPoints;
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
        .gameMatchPoints as GameMatchPoints;

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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 2,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
      ];

      const gameMatchPoints = getGameStats(gamePointHistory)
        .gameMatchPoints as GameMatchPoints;

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
        .gameMatchPoints as GameMatchPoints;

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
        .gameMatchPoints as GameMatchPoints;

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
          pointState: PointState.NotWon,
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
        .gameMatchPoints as GameMatchPoints;

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
        .gameMatchPoints as GameMatchPoints;

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
          .gameMatchPoints as GameMatchPoints;

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
          .gameMatchPoints as GameMatchPoints;

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
          .gameMatchPoints as GameMatchPoints;

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
  });

  describe("leads", () => {
    it("should be undefined when no points scored", () => {
      const gamePointHistory: GamePointHistory = [];
      const stats = getGameStats(gamePointHistory);
      expect(stats.leads).toBeUndefined();
    });
    it.each([true, false])(
      "should be 1 when first point scored",
      (team1WonPoint) => {
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1WonPoint,
            pointState: PointState.NotWon,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: team1WonPoint ? 1 : 0,
            team2Points: team1WonPoint ? 0 : 1,
          },
        ];
        const stats = getGameStats(gamePointHistory);
        const scoringTeamLeads = team1WonPoint
          ? stats.leads?.team1
          : stats.leads?.team2;
        const nonScoringTeamLeads = team1WonPoint
          ? stats.leads?.team2
          : stats.leads?.team1;
        expect(scoringTeamLeads).toEqual<TeamLeads>({
          biggest: 1,
          greatestDeficitOvercome: undefined,
        });
        expect(nonScoringTeamLeads).toBeUndefined();
      },
    );

    it("should be 2 when lead by 2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
      ];
      const stats = getGameStats(gamePointHistory);

      expect(stats.leads?.team1).toEqual<TeamLeads>({
        biggest: 2,
        greatestDeficitOvercome: undefined,
      });
    });

    it("should work with later leads", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1WonPoint: false,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1WonPoint: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
      ];
      const stats = getGameStats(gamePointHistory);

      expect(stats.leads?.team1).toEqual<TeamLeads>({
        biggest: 2,
        greatestDeficitOvercome: undefined,
      });
    });

    describe("when game won", () => {
      it.each([PointState.Team1Won, PointState.GameWonTeam1])(
        "should have undefined greatestDeficitOvercome when always lead",
        (winPointState) => {
          const gamePointHistory = fillArrayWithIndices(11).map((i) => {
            let pointState = PointState.NotWon;
            if (i === 9) {
              pointState = PointState.GamePointTeam1;
            } else if (i === 10) {
              pointState = winPointState;
            }

            const pointHistory: PointHistory = {
              date: new Date(),
              team1WonPoint: true,
              pointState,
              server: "Team1Player1",
              receiver: "Team2Player1",
              team1Points: i + 1,
              team2Points: 0,
            };
            return pointHistory;
          });

          const stats = getGameStats(gamePointHistory);
          expect(stats.leads?.team1?.greatestDeficitOvercome).toBeUndefined();
        },
      );
      it.each([1, 2])(
        "should have greatest deficit overcome as the greatest lead of the other team",
        (otherTeamLead) => {
          const losingTeamWinningPointHistories = fillArrayWithIndices(
            otherTeamLead,
          ).map((i) => {
            const losingTeamWinningPointHistory: PointHistory = {
              date: new Date(),
              team1WonPoint: false,
              pointState: PointState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player1",
              team1Points: 0,
              team2Points: i + 1,
            };
            return losingTeamWinningPointHistory;
          });
          const winningTeamPointHistories = fillArrayWithIndices(11).map(
            (i) => {
              let pointState = PointState.NotWon;
              if (i === 9) {
                pointState = PointState.GamePointTeam1;
              } else if (i === 10) {
                pointState = PointState.GameWonTeam1;
              }

              const winningTeamPointHistory: PointHistory = {
                date: new Date(),
                team1WonPoint: true,
                pointState,
                server: "Team1Player1",
                receiver: "Team2Player1",
                team1Points: i + 1,
                team2Points: otherTeamLead,
              };
              return winningTeamPointHistory;
            },
          );

          const stats = getGameStats([
            ...losingTeamWinningPointHistories,
            ...winningTeamPointHistories,
          ]);
          expect(stats.leads?.team1?.greatestDeficitOvercome).toEqual(
            otherTeamLead,
          );
          expect(stats.leads?.team2?.biggest).toEqual(otherTeamLead);
        },
      );
    });
  });

  describe("pointsbreakdown", () => {
    it("should be correct when no game points", () => {
      const gamePointHistory: GamePointHistory = [];
      const pointsBreakdown = getGameStats(gamePointHistory).pointsBreakdown;

      const expectedServeReceiveRecord: ServeReceiveRecord = {
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
      const expectedPointsBreakdown: PointsBreakdown = {
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
            pointState: PointState.NotWon,
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
        const expectedPointsBreakdown: PointsBreakdown = {
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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
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
      const expectedPointsBreakdown: PointsBreakdown = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });

    it("should be correct when 2 game points", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
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
      const expectedPointsBreakdown: PointsBreakdown = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });
    it("should be correct with multiple services", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team2Player1",
          receiver: "Team1Player1",
          team1WonPoint: true,
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team2Player1",
          receiver: "Team1Player1",
          team1WonPoint: false,
          team1Points: 2,
          team2Points: 2,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
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
      const expectedPointsBreakdown: PointsBreakdown = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });

    it("should work with doubles", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1WonPoint: true,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team2Player1",
          receiver: "Team1Player2",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team1Player2",
          receiver: "Team2Player2",
          team1WonPoint: false,
          team1Points: 1,
          team2Points: 2,
        },
        {
          date: new Date(),
          pointState: PointState.NotWon,
          server: "Team2Player2",
          receiver: "Team1Player1",
          team1WonPoint: true,
          team1Points: 2,
          team2Points: 2,
        },
        // switching receivers
        {
          date: new Date(),
          pointState: PointState.NotWon,
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
      const expectedPointsBreakdown: PointsBreakdown = {
        team1: team1TeamPointsBreakdown,
        team2: team2TeamPointsBreakdown,
      };

      expect(pointsBreakdown).toMatchWithGetters(expectedPointsBreakdown);
    });
  });
});
