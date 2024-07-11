import { getGameStats, GamePointHistory } from "../src/matchstats";
import { PointHistory, PointState } from "../src/umpire";
import { fillArrayWithIndices } from "../src/helpers/fillArray";
import { TeamLeads } from "../src/matchstats/LeadStats";
import {
  GameMatchPoints,
  GameMatchPointState,
} from "../src/matchstats/GameMatchPointsStats";

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
            pointState: PointState.NotWon,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: team1 ? 1 : 0,
            team2Points: team1 ? 0 : 1,
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
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: true,
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
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: false,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 3,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 4,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
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
          team1: true,
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
        const isMatchPoint =
          pointState === PointState.MatchPointTeam1 ||
          pointState === PointState.MatchPointTeam2;
        const team1 =
          pointState === PointState.GamePointTeam1 ||
          pointState === PointState.MatchPointTeam1;
        const gamePointHistory: GamePointHistory = [
          {
            date: new Date(),
            team1: true,
            pointState: PointState.NotWon,
            server: "Team1Player1",
            receiver: "Team2Player1",
            team1Points: 1,
            team2Points: 0,
          },
          {
            date: new Date(),
            team1,
            pointState,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints,
            team1Points: team1 ? 2 : 1,
            team2Points: team1 ? 0 : 1,
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
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: true,
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
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: false,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: false,
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
        },
      ]);
    });

    it("should increment points saved when point is saved and no longer game point - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: false,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 0,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
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
        },
      ]);
    });

    it("should set converted to true when match point is converted - Team1", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          pointState: PointState.MatchPointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: false,
          pointState: PointState.MatchPointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
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
        },
      ]);
    });

    it("should set converted to true when game point is converted - Team2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: false,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 0,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.GamePointTeam2,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: false,
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
        },
      ]);
    });

    it("should create a new gameMatchPointState when a new game point is entered", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 2,
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: false,
          pointState: PointState.GamePointTeam1,
          server: "Team1Player1",
          receiver: "Team2Player1",
          gameOrMatchPoints: 1,
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
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
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 10,
            team2Points: 9,
          },
          {
            date: new Date(),
            team1: false,
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
            pointState: PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 9,
            team2Points: 10,
          },
          {
            date: new Date(),
            team1: true,
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
            pointState: PointState.GamePointTeam1,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 2, // 10-9
            team1Points: 10,
            team2Points: 9,
          },
          {
            date: new Date(),
            team1: false,
            pointState: PointState.GamePointTeam1 + PointState.GamePointTeam2,
            server: "Team1Player1",
            receiver: "Team2Player1",
            gameOrMatchPoints: 1,
            team1Points: 10,
            team2Points: 10,
          },
          {
            date: new Date(),
            team1: true,
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

  describe("leads", () => {
    it("should be undefined when no points scored", () => {
      const gamePointHistory: GamePointHistory = [];
      const stats = getGameStats(gamePointHistory);
      expect(stats.leads).toBeUndefined();
    });
    it.each([true, false])("should be 1 when first point scored", (team1) => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: team1 ? 1 : 0,
          team2Points: team1 ? 0 : 1,
        },
      ];
      const stats = getGameStats(gamePointHistory);
      const scoringTeamLeads = team1 ? stats.leads?.team1 : stats.leads?.team2;
      const nonScoringTeamLeads = team1
        ? stats.leads?.team2
        : stats.leads?.team1;
      expect(scoringTeamLeads).toEqual<TeamLeads>({
        biggest: 1,
        greatestDeficitOvercome: undefined,
      });
      expect(nonScoringTeamLeads).toBeUndefined();
    });

    it("should be 2 when lead by 2", () => {
      const gamePointHistory: GamePointHistory = [
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: true,
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
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 0,
        },
        {
          date: new Date(),
          team1: false,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 1,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
          pointState: PointState.NotWon,
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Points: 2,
          team2Points: 1,
        },
        {
          date: new Date(),
          team1: true,
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
              team1: true,
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
              team1: false,
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
                team1: true,
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

  xdescribe("pointsbreakdown", () => {});
});
