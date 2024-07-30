import { PointHistory, PointState } from "../umpire";
import { getLast } from "../umpire/helpers";
import {
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
  team1WonGameOrMatch,
  team2WonGameOrMatch,
} from "../umpire/pointStateHelpers";

export interface EnteredGameMatchPointStates {
  team1: GameMatchPointState | undefined;
  team2: GameMatchPointState | undefined;
}

export interface GameMatchPointState {
  isGamePoint: boolean;
  numGameMatchPoints: number;
  pointsSaved: number;
  converted: boolean;
  pointNumber: number;
}

export interface SavedPoint {
  isGamePoint: boolean;
  at: number;
}
export interface GameMatchPointDeucesStats {
  team1: GameMatchPointState[];
  team2: GameMatchPointState[];
  savedPointsAt: SavedPoint[];
  numDeuces: number;
}

export class GameMatchPointDeucesStatistician {
  private pointNumber = 0;
  private gameMatchPoints: GameMatchPointDeucesStats = {
    team1: [],
    team2: [],
    savedPointsAt: [],
    numDeuces: 0,
  };

  private getEnteredGameMatchPointState = (
    team1: boolean,
  ): GameMatchPointState | undefined => {
    const states = team1
      ? this.gameMatchPoints.team1
      : this.gameMatchPoints.team2;
    if (states.length === 0) {
      return undefined;
    }
    const lastState = states[states.length - 1];
    const allPointsSaved =
      lastState.pointsSaved === lastState.numGameMatchPoints;
    return allPointsSaved ? undefined : lastState;
  };

  private getEnteredGameMatchPointStates = (): EnteredGameMatchPointStates => {
    return {
      team1: this.getEnteredGameMatchPointState(true),
      team2: this.getEnteredGameMatchPointState(false),
    };
  };

  private savePoint = (gameMatchPointState: GameMatchPointState) => {
    gameMatchPointState.pointsSaved++;
    this.gameMatchPoints.savedPointsAt.push({
      isGamePoint: gameMatchPointState.isGamePoint,
      at: this.pointNumber,
    });
  };

  private incrementPointsSavedIfEnteredGameOrMatchPoint = ({
    team1: team1State,
    team2: team2State,
  }: EnteredGameMatchPointStates) => {
    if (team1State !== undefined) {
      this.savePoint(team1State);
    }
    if (team2State !== undefined) {
      this.savePoint(team2State);
    }
  };

  private convert = (
    { team1: team1State, team2: team2State }: EnteredGameMatchPointStates,
    team1: boolean,
  ) => {
    const state = team1 ? team1State : team2State;
    state.converted = true;
    const otherState = team1 ? team2State : team1State;
    if (otherState !== undefined) {
      this.savePoint(otherState);
    }
  };

  private newState = (
    team1: boolean,
    gameOrMatchPoints: number,
    isGamePoint: boolean,
  ) => {
    const states = team1
      ? this.gameMatchPoints.team1
      : this.gameMatchPoints.team2;
    states.push({
      numGameMatchPoints: gameOrMatchPoints,
      pointsSaved: 0,
      converted: false,
      pointNumber: this.pointNumber,
      isGamePoint,
    });
  };

  private savePointOrNewState = (
    { team1: team1State, team2: team2State }: EnteredGameMatchPointStates,
    team1: boolean,
    gameOrMatchPoints: number,
    isGamePoint: boolean,
  ) => {
    const state = team1 ? team1State : team2State;
    if (state === undefined) {
      this.newState(team1, gameOrMatchPoints, isGamePoint);
    } else {
      this.savePoint(state);
    }
  };

  private applyGamePointOrMatchPoint(
    enteredGameMatchPointStates: EnteredGameMatchPointStates,
    point: PointHistory,
  ) {
    const { team1: team1State, team2: team2State } =
      enteredGameMatchPointStates;
    const gamePointTeam1 = isGamePointTeam1(point.pointState);
    const gamePointTeam2 = isGamePointTeam2(point.pointState);
    const matchPointTeam1 = isMatchPointTeam1(point.pointState);
    const matchPointTeam2 = isMatchPointTeam2(point.pointState);
    const isGameOrMatchPointTeam1 = gamePointTeam1 || matchPointTeam1;
    const isGameOrMatchPointTeam2 = gamePointTeam2 || matchPointTeam2;
    const isGamePoint = gamePointTeam1 || gamePointTeam2;
    // if in a game/match point state then have not gone from one to the other
    if (isGameOrMatchPointTeam1 && isGameOrMatchPointTeam2) {
      this.incrementPointsSavedIfEnteredGameOrMatchPoint(
        enteredGameMatchPointStates,
      );
      team1State === undefined &&
        this.newState(true, point.gameOrMatchPoints!, isGamePoint);
      team2State === undefined &&
        this.newState(false, point.gameOrMatchPoints!, isGamePoint);
    } else if (isGameOrMatchPointTeam1) {
      this.savePointOrNewState(
        enteredGameMatchPointStates,
        true,
        point.gameOrMatchPoints!,
        isGamePoint,
      );
    } else {
      this.savePointOrNewState(
        enteredGameMatchPointStates,
        false,
        point.gameOrMatchPoints!,
        isGamePoint,
      );
    }
  }

  nextPoint = (point: PointHistory) => {
    if (point.pointState === PointState.Deuce) {
      this.gameMatchPoints.numDeuces++;
    }
    this.pointNumber++;
    const enteredGameMatchPointStates = this.getEnteredGameMatchPointStates();
    if (
      point.pointState === PointState.Default ||
      point.pointState === PointState.Deuce
    ) {
      this.incrementPointsSavedIfEnteredGameOrMatchPoint(
        enteredGameMatchPointStates,
      );
    } else if (team1WonGameOrMatch(point.pointState)) {
      this.convert(enteredGameMatchPointStates, true);
    } else if (team2WonGameOrMatch(point.pointState)) {
      this.convert(enteredGameMatchPointStates, false);
    } else {
      this.applyGamePointOrMatchPoint(enteredGameMatchPointStates, point);
    }
  };

  getStats(): GameMatchPointDeucesStats | undefined {
    if (
      this.gameMatchPoints.team1.length > 0 ||
      this.gameMatchPoints.team2.length > 0
    ) {
      return this.gameMatchPoints;
    }
  }
}

export interface AvailableGameMatchPoints {
  available: number;
  isGamePoint: boolean;
}
export function availableGameMatchPoints(
  states: GameMatchPointState[],
): AvailableGameMatchPoints | undefined {
  if (states.length === 0) {
    return undefined;
  }
  const lastGameMatchPointState = getLast(states);
  if (lastGameMatchPointState.converted) {
    return undefined;
  }
  const available =
    lastGameMatchPointState.numGameMatchPoints -
    lastGameMatchPointState.pointsSaved;

  if (available === 0) {
    return undefined;
  }
  return {
    available,
    isGamePoint: lastGameMatchPointState.isGamePoint,
  };
}
