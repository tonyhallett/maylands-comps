import { GamePointHistory, PointHistory } from "../umpire";
import {
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
  MatchWinState,
} from "../umpire/getMatchWinState";
export { GamePointHistory } from "../umpire";

export interface TeamStreaks {
  streaks: number[];
  longestStreak: number;
}
export interface Streaks {
  team1: TeamStreaks;
  team2: TeamStreaks;
}
interface StreaksInfo extends Streaks {
  team1Last: boolean | undefined;
}

export interface GameMatchPointState {
  numGameMatchPoints: number;
  pointsSaved: number;
  converted: boolean;
}

export interface GameMatchPoints {
  isMatchPoint: boolean;
  team1: GameMatchPointState[];
  team2: GameMatchPointState[];
}
export interface GameStats {
  streaks: Streaks;
  gameMatchPoints?: GameMatchPoints;
}

function getLongestStreak(streaks: number[]): number {
  if (streaks.length === 0) {
    return 0;
  }
  return Math.max(...streaks);
}

export function getGameStats(gamePointHistory: GamePointHistory): GameStats {
  const streaks: StreaksInfo = {
    team1: { streaks: [], longestStreak: 0 },
    team2: { streaks: [], longestStreak: 0 },
    team1Last: undefined,
  };
  const doStreaks = (point: PointHistory) => {
    const teamStreaks = point.team1 ? streaks.team1 : streaks.team2;
    if (streaks.team1Last === undefined) {
      teamStreaks.streaks.push(1);
    } else {
      if (streaks.team1Last === point.team1) {
        const streak = teamStreaks.streaks[teamStreaks.streaks.length - 1];
        teamStreaks.streaks[teamStreaks.streaks.length - 1] = streak + 1;
      } else {
        teamStreaks.streaks.push(1);
      }
    }
    streaks.team1Last = point.team1;
  };
  const gameMatchPoints: GameMatchPoints = {
    team1: [],
    team2: [],
    isMatchPoint: false,
  };

  const doGameMatchPoints = (point: PointHistory) => {
    const getEnteredGameMatchPointStates = () => {
      const getEnteredGameMatchPointState = (team1: boolean) => {
        const states = team1 ? gameMatchPoints.team1 : gameMatchPoints.team2;
        if (states.length === 0) {
          return undefined;
        }
        const lastState = states[states.length - 1];
        const allPointsSaved =
          lastState.pointsSaved === lastState.numGameMatchPoints;
        return allPointsSaved ? undefined : lastState;
      };
      return {
        team1: getEnteredGameMatchPointState(true),
        team2: getEnteredGameMatchPointState(false),
      };
    };
    const { team1: team1State, team2: team2State } =
      getEnteredGameMatchPointStates();
    const pointSaved = () => {
      if (team1State !== undefined) {
        team1State.pointsSaved++;
      }
      if (team2State !== undefined) {
        team2State.pointsSaved++;
      }
    };
    const convertAndPossiblySave = (team1: boolean) => {
      const state = team1 ? team1State : team2State;
      state.converted = true;
      const otherState = team1 ? team2State : team1State;
      if (otherState !== undefined) {
        otherState.pointsSaved++;
      }
    };
    const newState = (team1: boolean) => {
      const states = team1 ? gameMatchPoints.team1 : gameMatchPoints.team2;
      states.push({
        numGameMatchPoints: point.gameOrMatchPoints!,
        pointsSaved: 0,
        converted: false,
      });
    };
    const savePointOrNewState = (team1: boolean) => {
      const state = team1 ? team1State : team2State;
      if (state === undefined) {
        newState(team1);
      } else {
        state.pointsSaved++;
      }
    };

    if (point.matchState === MatchWinState.NotWon) {
      pointSaved();
    } else if (point.matchState === MatchWinState.Team1Won) {
      convertAndPossiblySave(true);
    } else if (point.matchState === MatchWinState.Team2Won) {
      convertAndPossiblySave(false);
    } else {
      // in game point or match point state
      const gamePointTeam1 = isGamePointTeam1(point.matchState);
      const gamePointTeam2 = isGamePointTeam2(point.matchState);
      const matchPointTeam1 = isMatchPointTeam1(point.matchState);
      const matchPointTeam2 = isMatchPointTeam2(point.matchState);
      const isGameOrMatchPointTeam1 = gamePointTeam1 || matchPointTeam1;
      const isGameOrMatchPointTeam2 = gamePointTeam2 || matchPointTeam2;

      // if in a game/match point state then have not gone from one to the other
      if (isGameOrMatchPointTeam1 && isGameOrMatchPointTeam2) {
        pointSaved();
        team1State === undefined && newState(true);
        team2State === undefined && newState(false);
      } else if (isGameOrMatchPointTeam1) {
        savePointOrNewState(true);
      } else {
        savePointOrNewState(false);
      }

      gameMatchPoints.isMatchPoint = matchPointTeam1 || matchPointTeam2;
    }
  };

  gamePointHistory.forEach((point) => {
    doStreaks(point);
    doGameMatchPoints(point);
  });

  streaks.team1.longestStreak = getLongestStreak(streaks.team1.streaks);
  streaks.team2.longestStreak = getLongestStreak(streaks.team2.streaks);
  const gameStats: GameStats = {
    streaks: {
      team1: {
        streaks: streaks.team1.streaks,
        longestStreak: streaks.team1.longestStreak,
      },
      team2: {
        streaks: streaks.team2.streaks,
        longestStreak: streaks.team2.longestStreak,
      },
    },
  };
  if (gameMatchPoints.team1.length > 0 || gameMatchPoints.team2.length > 0) {
    gameStats.gameMatchPoints = gameMatchPoints;
  }

  return gameStats;
}
