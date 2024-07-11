import { PointHistory, PointState } from "../umpire";

export interface EnteredGameMatchPointStates {
  team1: GameMatchPointState | undefined;
  team2: GameMatchPointState | undefined;
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

export const isMatchPointTeam1 = (pointState: PointState) =>
  Boolean(pointState & PointState.MatchPointTeam1);
export const isMatchPointTeam2 = (pointState: PointState) =>
  Boolean(pointState & PointState.MatchPointTeam2);
export const isGamePointTeam1 = (pointState: PointState) =>
  Boolean(pointState & PointState.GamePointTeam1);
export const isGamePointTeam2 = (pointState: PointState) =>
  Boolean(pointState & PointState.GamePointTeam2);

export class GameMatchPointsStats {
  private gameMatchPoints: GameMatchPoints = {
    team1: [],
    team2: [],
    isMatchPoint: false,
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

  private pointSaved = ({
    team1: team1State,
    team2: team2State,
  }: EnteredGameMatchPointStates) => {
    if (team1State !== undefined) {
      team1State.pointsSaved++;
    }
    if (team2State !== undefined) {
      team2State.pointsSaved++;
    }
  };

  private convertAndPossiblySave = (
    { team1: team1State, team2: team2State }: EnteredGameMatchPointStates,
    team1: boolean,
  ) => {
    const state = team1 ? team1State : team2State;
    state.converted = true;
    const otherState = team1 ? team2State : team1State;
    if (otherState !== undefined) {
      otherState.pointsSaved++;
    }
  };

  private newState = (team1: boolean, gameOrMatchPoints: number) => {
    const states = team1
      ? this.gameMatchPoints.team1
      : this.gameMatchPoints.team2;
    states.push({
      numGameMatchPoints: gameOrMatchPoints,
      pointsSaved: 0,
      converted: false,
    });
  };

  private savePointOrNewState = (
    { team1: team1State, team2: team2State }: EnteredGameMatchPointStates,
    team1: boolean,
    gameOrMatchPoints: number,
  ) => {
    const state = team1 ? team1State : team2State;
    if (state === undefined) {
      this.newState(team1, gameOrMatchPoints);
    } else {
      state.pointsSaved++;
    }
  };

  private team1WonGame = (point: PointHistory) => {
    return (
      point.pointState === PointState.Team1Won ||
      point.pointState === PointState.GameWonTeam1
    );
  };

  private team2WonGame = (point: PointHistory) => {
    return (
      point.pointState === PointState.Team2Won ||
      point.pointState === PointState.GameWonTeam2
    );
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

    // if in a game/match point state then have not gone from one to the other
    if (isGameOrMatchPointTeam1 && isGameOrMatchPointTeam2) {
      this.pointSaved(enteredGameMatchPointStates);
      team1State === undefined && this.newState(true, point.gameOrMatchPoints!);
      team2State === undefined &&
        this.newState(false, point.gameOrMatchPoints!);
    } else if (isGameOrMatchPointTeam1) {
      this.savePointOrNewState(
        enteredGameMatchPointStates,
        true,
        point.gameOrMatchPoints!,
      );
    } else {
      this.savePointOrNewState(
        enteredGameMatchPointStates,
        false,
        point.gameOrMatchPoints!,
      );
    }

    this.gameMatchPoints.isMatchPoint = matchPointTeam1 || matchPointTeam2;
  }

  nextPoint = (point: PointHistory) => {
    const enteredGameMatchPointStates = this.getEnteredGameMatchPointStates();
    if (point.pointState === PointState.NotWon) {
      this.pointSaved(enteredGameMatchPointStates);
    } else if (this.team1WonGame(point)) {
      this.convertAndPossiblySave(enteredGameMatchPointStates, true);
    } else if (this.team2WonGame(point)) {
      this.convertAndPossiblySave(enteredGameMatchPointStates, false);
    } else {
      this.applyGamePointOrMatchPoint(enteredGameMatchPointStates, point);
    }
  };

  getStats(): GameMatchPoints | undefined {
    if (
      this.gameMatchPoints.team1.length > 0 ||
      this.gameMatchPoints.team2.length > 0
    ) {
      return this.gameMatchPoints;
    }
  }
}
