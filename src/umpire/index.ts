import { getLast, isEven } from "./helpers";
import {
  MatchWinState,
  MatchWinStatus,
  getMatchWinStatus,
} from "./getMatchWinState";
import { requiredGamesToWin } from "./requiredGamesToWin";
import {
  InitialServersDoublesReceiver,
  ServerReceiverChoice,
  availableServerReceiverChoice,
} from "./availableServerReceiverChoice";
import { reachedAlternateServes } from "./reachedAlternateServes";
import { ServerReceiver } from "./commonTypes";
import { getInitialServerReceiverForGame } from "./getInitialServerReceiverForGame";
import {
  DoublesEndPoints as DoublesEndPointsScored,
  getServerReceiver,
} from "./getServerReceiver";

export interface TeamScores {
  team1Score: TeamScore;
  team2Score: TeamScore;
}

export interface MatchState extends TeamScores {
  canResetServerReceiver: boolean;
  team1Left: boolean;
  server: Player | undefined;
  receiver: Player | undefined;
  remainingServes: number;
  matchWinState: MatchWinState;
  gameOrMatchPoints?: number;
  gameScores: ReadonlyArray<GameScore>;
  canUndoPoint: boolean;
  serverReceiverChoice: ServerReceiverChoice;
  pointHistory: ReadonlyArray<ReadonlyArray<PointHistory>>;
  isEnds: boolean;
}
type Team1Player1 = "Team1Player1";
type Team1Player2 = "Team1Player2";
type Team2Player1 = "Team2Player1";
type Team2Player2 = "Team2Player2";
export type Team1Player = Team1Player1 | Team1Player2;
export type Team2Player = Team2Player1 | Team2Player2;
export type SinglesPlayer = Team1Player1 | Team2Player1;
export type Player = Team1Player | Team2Player;
export interface TeamScore {
  games: number;
  points: number;
}

export interface GameScore {
  team1Points: number;
  team2Points: number;
}

export interface CompetitionRules {
  upTo: number;
  clearBy2: boolean;
  numServes: number;
}

export interface MatchOptions extends CompetitionRules {
  team1StartGameScore: number;
  team2StartGameScore: number;
  bestOf: number;
}

enum GameWonState {
  NotWon,
  Team1Won,
  Team2Won,
}

export enum PointState {
  NotWon = 0,
  Team1Won = 1,
  Team2Won = 2,
  GamePointTeam1 = 4,
  GamePointTeam2 = 8,
  MatchPointTeam1 = 16,
  MatchPointTeam2 = 32,
  GameWonTeam1 = 64,
  GameWonTeam2 = 128,
}

export interface GameScoreState extends GameScore {
  pointState: PointState;
  team1WonPoint: boolean;
}

export interface PointHistory extends GameScoreState, ServerReceiver {
  date: Date;
  pointState: PointState;
  gameOrMatchPoints?: number;
}
export type GamePointHistory = PointHistory[];

type SavePointHistory = Omit<PointHistory, "date"> & {
  date: string;
};

interface SaveGameState extends TeamScores {
  isDoubles: boolean;
  pointHistory: SavePointHistory[][];
  gameScores: GameScore[];
  team1Left: boolean;
  initialServersDoublesReceiver: InitialServersDoublesReceiver;
  doublesEndsPointsScored: DoublesEndPointsScored | undefined;
}
export interface SaveState extends MatchOptions, SaveGameState {}

export class Umpire {
  private get canUndoPoint(): boolean {
    let canUndo = false;
    for (let i = 0; i < this._pointHistory.length; i++) {
      if (this._pointHistory[i].length > 0) {
        canUndo = true;
        break;
      }
    }
    return canUndo;
  }
  undoPoint(): MatchState {
    if (this._pointHistory.length === 0) {
      throw new Error("No points to undo");
    }
    if (this.isStartOfGame()) {
      this.undoStartOfGameState();
    } else {
      this.undoMidGameState();
    }

    // don't need to undo the matchWinState/remainingServes as is calculated
    return this.getMatchState();
  }

  private undoStartOfGameState() {
    this.undoGameWinScore();
    this.switchEnds();
    if (this.isDoubles) {
      this.initialServersDoublesReceiver.gameInitialServers.pop();
    }
  }

  private undoGameWinScore() {
    this._pointHistory.pop();
    const lastGameScore = this._gameScores.pop();
    const lastPoint = this.removeLastPointHistory();
    const teamScoreToReduce = lastPoint.team1WonPoint
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.games -= 1;
    this._team1Score.points = lastGameScore.team1Points;
    this._team2Score.points = lastGameScore.team2Points;
    teamScoreToReduce.points -= 1;
  }

  private undoMidGameState() {
    const lastPoint = this.removeLastPointHistory();
    if (this.isEndsFromTeamScoringLast(lastPoint.team1WonPoint)) {
      this.switchEnds();
      this.doublesEndsPointsScored = "NotEnds";
    }
    const teamScoreToReduce = lastPoint.team1WonPoint
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.points -= 1;
  }

  private removeLastPointHistory() {
    const lastGamePointHistory = this.getLastGamePointHistory();
    return lastGamePointHistory.pop();
  }

  private getLastGamePointHistory(): PointHistory[] {
    return getLast(this._pointHistory);
  }

  private isStartOfGame(): boolean {
    return (
      this._team1Score.points === this._team1StartGameScore &&
      this._team2Score.points === this._team2StartGameScore
    );
  }
  private _pointHistory: GamePointHistory[] = [[]];

  private get matchWinStatus(): MatchWinStatus {
    return getMatchWinStatus(
      {
        bestOf: this.bestOf,
        upTo: this._upTo,
        clearBy2: this._clearBy2,
      },
      this.team1Score,
      this.team2Score,
    );
  }

  private _gameScores: GameScore[] = [];
  private _team1StartGameScore: number;
  private _team2StartGameScore: number;
  public get team1StartGameScore(): number {
    return this._team1StartGameScore;
  }
  public get team2StartGameScore(): number {
    return this._team2StartGameScore;
  }

  private _upTo: number;
  public get upTo() {
    return this._upTo;
  }

  private initialServersDoublesReceiver: InitialServersDoublesReceiver = {
    gameInitialServers: [],
    firstDoublesReceiver: undefined,
  };
  private _team1Left: boolean = true;

  private get serverReceiverChoice(): ServerReceiverChoice {
    return availableServerReceiverChoice(
      this.isDoubles,
      this.initialServersDoublesReceiver,
      this.gamesPlayed() + 1,
    );
  }

  private _team1Score: TeamScore = { games: 0, points: 0 };
  private get team1Score(): Readonly<TeamScore> {
    return { ...this._team1Score };
  }

  private _team2Score: TeamScore = { games: 0, points: 0 };
  private get team2Score(): Readonly<TeamScore> {
    return { ...this._team2Score };
  }

  private getPointsScored() {
    const totalPoints = this._team1Score.points + this._team2Score.points;
    return (
      totalPoints - (this._team1StartGameScore + this._team2StartGameScore)
    );
  }

  private _remainingServesAtStartOfGame: number = 0;
  private get remainingServes(): number {
    if (this.reachedAlternateServes()) {
      return 1;
    }
    const pointsScored = this.getPointsScored();
    if (pointsScored < this._remainingServesAtStartOfGame) {
      return this._remainingServesAtStartOfGame - pointsScored;
    }
    if (pointsScored === this._remainingServesAtStartOfGame) {
      return this._numServes;
    }
    const pointsScoredAfterInitialServer =
      pointsScored - this._remainingServesAtStartOfGame;
    return this._numServes - (pointsScoredAfterInitialServer % this._numServes);
  }
  private _numServes: number;
  public get numServes() {
    return this._numServes;
  }
  private dateProvider: () => Date = () => new Date();

  private _clearBy2: boolean;
  public get clearBy2() {
    return this._clearBy2;
  }
  private _team1MidwayPoints: number;
  public get team1MidwayPoints() {
    return this._team1MidwayPoints;
  }
  private _team2MidwayPoints: number;
  public get team2MidwayPoints() {
    return this._team2MidwayPoints;
  }
  private doublesEndsPointsScored: DoublesEndPointsScored | undefined;
  private isDoubles: boolean;
  public readonly bestOf: number;
  constructor(matchOptions: MatchOptions, isDoubles: boolean);
  constructor(saveState: SaveState);
  constructor(
    saveStateOrMatchOptions: SaveState | MatchOptions,
    isDoubles?: boolean,
  ) {
    let matchOptions: MatchOptions;
    if (isDoubles === undefined) {
      const saveState = saveStateOrMatchOptions as SaveState;
      isDoubles = saveState.isDoubles;
      matchOptions = {
        team1StartGameScore: saveState.team1StartGameScore,
        team2StartGameScore: saveState.team2StartGameScore,
        bestOf: saveState.bestOf,
        upTo: saveState.upTo,
        clearBy2: saveState.clearBy2,
        numServes: saveState.numServes,
      };
      const saveGameState: Omit<SaveGameState, "isDoubles"> = {
        pointHistory: saveState.pointHistory,
        gameScores: saveState.gameScores,
        team1Score: saveState.team1Score,
        team2Score: saveState.team2Score,
        team1Left: saveState.team1Left,
        initialServersDoublesReceiver: saveState.initialServersDoublesReceiver,
        doublesEndsPointsScored: saveState.doublesEndsPointsScored,
      };
      this._pointHistory = saveGameState.pointHistory.map(
        (savedGameHistory) => {
          return savedGameHistory.map((savedPoint) => {
            return {
              ...savedPoint,
              date: new Date(savedPoint.date),
            };
          });
        },
      );
      this._gameScores = saveGameState.gameScores;
      this._team1Score = saveGameState.team1Score;
      this._team2Score = saveGameState.team2Score;
      this._team1Left = saveGameState.team1Left;
      this.initialServersDoublesReceiver =
        saveGameState.initialServersDoublesReceiver;
      this.doublesEndsPointsScored = saveGameState.doublesEndsPointsScored;
    } else {
      matchOptions = saveStateOrMatchOptions as MatchOptions;

      this._team1Score.points = matchOptions.team1StartGameScore;
      this._team2Score.points = matchOptions.team2StartGameScore;
    }
    this.isDoubles = isDoubles;
    this._team1StartGameScore = matchOptions.team1StartGameScore;
    this._team2StartGameScore = matchOptions.team2StartGameScore;

    this.throwIfNotOdd(this.bestOf);
    this.bestOf = matchOptions.bestOf;

    this.throwIfNotMoreThan0(matchOptions.numServes);
    this._numServes = matchOptions.numServes;
    this.setRemainingServesAtStartOfGame();

    this._upTo = matchOptions.upTo;
    this._clearBy2 = matchOptions.clearBy2;
    this._team1MidwayPoints = this.getMidwayPoints(true);
    this._team2MidwayPoints = this.getMidwayPoints(false);
    this.doublesEndsPointsScored = this.isDoubles ? "NotEnds" : undefined;
  }

  getSaveState(): SaveState {
    return {
      isDoubles: this.isDoubles,
      pointHistory: this._pointHistory.map((gameHistory) => {
        return gameHistory.map((point) => {
          return {
            ...point,
            date: point.date.toISOString(),
          };
        });
      }),
      gameScores: this._gameScores,
      team1Score: this._team1Score,
      team2Score: this._team2Score,
      team1StartGameScore: this._team1StartGameScore,
      team2StartGameScore: this._team2StartGameScore,
      bestOf: this.bestOf,
      upTo: this._upTo,
      clearBy2: this._clearBy2,
      numServes: this._numServes,
      initialServersDoublesReceiver: this.initialServersDoublesReceiver,
      doublesEndsPointsScored: this.doublesEndsPointsScored,
      team1Left: this._team1Left,
    };
  }

  private getServerReceiver(
    serverReceiverChoice: ServerReceiverChoice,
    matchWon: boolean,
  ): ServerReceiver {
    const serverReceiver: ServerReceiver = {
      server: undefined,
      receiver: undefined,
    };
    if (matchWon) {
      return serverReceiver;
    }
    if (serverReceiverChoice.servers.length === 0) {
      const gameInitialServer = getLast(
        this.initialServersDoublesReceiver.gameInitialServers,
      );
      if (serverReceiverChoice.firstGameDoublesReceivers.length > 0) {
        serverReceiver.server = gameInitialServer;
      } else {
        const initialServerReceiverForGame = getInitialServerReceiverForGame(
          this.initialServersDoublesReceiver,
          this.gamesPlayed() + 1,
        );
        return getServerReceiver({
          initialServer: initialServerReceiverForGame.server,
          initialReceiver: initialServerReceiverForGame.receiver,
          doublesEndsPoints: this.doublesEndsPointsScored,
          team1Points: this.team1Score.points,
          team2Points: this.team2Score.points,
          pointsWon:
            this.team1Score.points -
            this._team1StartGameScore +
            (this.team2Score.points - this._team2StartGameScore),
          alternateServesAt: this._upTo - 1,
          remainingServesAtStartOfGame: this._remainingServesAtStartOfGame,
          numServes: this._numServes,
        });
      }
    }
    return serverReceiver;
  }

  private matchWon(matchWinState: MatchWinState) {
    return (
      matchWinState === MatchWinState.Team1Won ||
      matchWinState === MatchWinState.Team2Won
    );
  }

  public getMatchState(): MatchState {
    const matchWinStatus = this.matchWinStatus;
    const matchWinState = matchWinStatus.matchWinState;
    const matchWon = this.matchWon(matchWinState);
    let serverReceiverChoice: ServerReceiverChoice;
    if (matchWon) {
      serverReceiverChoice = {
        servers: [],
        firstGameDoublesReceivers: [],
      };
    } else {
      serverReceiverChoice = this.serverReceiverChoice;
    }

    const remainingServes = this.remainingServes;

    const lastGamePointHistory = this.getLastGamePointHistory();
    let canResetServerReceiver =
      lastGamePointHistory.length === 0 &&
      serverReceiverChoice.servers.length === 0 &&
      serverReceiverChoice.firstGameDoublesReceivers.length === 0;

    if (!this.isDoubles && this.gamesPlayed() > 0) {
      canResetServerReceiver = false;
    }

    const matchState: MatchState = {
      canUndoPoint: this.canUndoPoint,
      gameScores: this._gameScores,
      matchWinState,
      remainingServes,
      team1Left: this._team1Left,
      team1Score: this.team1Score,
      team2Score: this.team2Score,
      serverReceiverChoice,
      pointHistory: this._pointHistory,
      ...this.getServerReceiver(
        serverReceiverChoice,
        this.matchWon(matchWinState),
      ),
      isEnds: this.isEnds(),
      canResetServerReceiver,
    };
    if (matchWinStatus.gameOrMatchPoints !== undefined) {
      matchState.gameOrMatchPoints = matchWinStatus.gameOrMatchPoints;
    }
    return matchState;
  }

  private setRemainingServesAtStartOfGame(): void {
    const totalStartScores =
      Math.abs(this._team1StartGameScore) + Math.abs(this._team2StartGameScore);

    this._remainingServesAtStartOfGame =
      this._numServes - (totalStartScores % this._numServes);
  }

  private throwIfNotMoreThan0(numServes: number): void {
    if (numServes <= 0) {
      throw new Error("Num serves must be more than 0");
    }
  }

  private throwIfNotOdd(bestOf: number): void {
    if (isEven(bestOf)) {
      throw new Error("Best of must be an odd number");
    }
  }

  setServer(player: Player): MatchState {
    if (!this.serverReceiverChoice.servers.includes(player)) {
      throw new Error("Player not available");
    }
    this.initialServersDoublesReceiver.gameInitialServers.push(player);
    return this.getMatchState();
  }

  setFirstGameDoublesReceiver(player: Player): MatchState {
    if (this.serverReceiverChoice.firstGameDoublesReceivers.includes(player)) {
      this.initialServersDoublesReceiver.firstDoublesReceiver = player;
    } else {
      throw new Error("receiver is not an available receiver");
    }
    return this.getMatchState();
  }

  resetServerReceiver(): MatchState {
    if (this.gamesPlayed() === 0) {
      this.initialServersDoublesReceiver = {
        gameInitialServers: [],
        firstDoublesReceiver: undefined,
      };
    } else {
      this.initialServersDoublesReceiver.gameInitialServers.pop();
    }

    return this.getMatchState();
  }

  switchEnds(): MatchState {
    this._team1Left = !this._team1Left;
    return this.getMatchState();
  }

  pointScored(team1: boolean): MatchState {
    const gameWonState = this.addPoint(team1);
    if (this.isDoubles) {
      this.setDoublesEndsPoints(team1);
    }

    if (gameWonState === GameWonState.NotWon) {
      this.pointScoredAndNotWon(team1);
    } else {
      this.nextGame(gameWonState === GameWonState.Team1Won);
    }

    return this.getMatchState();
  }

  private setDoublesEndsPoints(team1: boolean) {
    if (
      this.doublesEndsPointsScored === "NotEnds" &&
      this.isEndsFromTeamScoringLast(team1)
    ) {
      this.doublesEndsPointsScored = this.getPointsScored();
    }
  }

  private addPoint(team1: boolean): GameWonState {
    const serverReceiver = this.getServerReceiver(
      this.serverReceiverChoice,
      false,
    );
    this.incrementTeamPoints(team1);
    return this.addPointHistory(team1, serverReceiver);
  }

  private incrementTeamPoints(team1: boolean) {
    const teamScore = team1 ? this._team1Score : this._team2Score;
    teamScore.points += 1;
  }

  private getPointState(
    matchWinState: MatchWinState,
    gameWonState: GameWonState,
  ): PointState {
    let pointState = matchWinState as unknown as PointState;
    switch (gameWonState) {
      case GameWonState.Team1Won:
        pointState = PointState.GameWonTeam1;
        break;
      case GameWonState.Team2Won:
        pointState = PointState.GameWonTeam2;
        break;
    }
    return pointState;
  }

  private addPointHistory(
    team1: boolean,
    serverReceiver: ServerReceiver,
  ): GameWonState {
    const date = this.dateProvider();
    const matchWinStatus = this.matchWinStatus;
    const matchState = matchWinStatus.matchWinState;

    const gameWonState = this.getGameWonState();
    const pointState = this.getPointState(matchState, gameWonState);

    const pointHistory: PointHistory = {
      team1WonPoint: team1,
      date,
      pointState,
      ...serverReceiver,
      team1Points: this._team1Score.points,
      team2Points: this._team2Score.points,
    };
    if (matchWinStatus.gameOrMatchPoints !== undefined) {
      pointHistory.gameOrMatchPoints = matchWinStatus.gameOrMatchPoints;
    }

    this._pointHistory[this._pointHistory.length - 1].push(pointHistory);
    return gameWonState;
  }

  private pointScoredAndNotWon(team1: boolean) {
    const isMidwayLastGame = this.isEndsFromTeamScoringLast(team1); // todo affects server and receiver for doubles
    if (isMidwayLastGame) {
      this.switchEnds();
    }
  }

  private reachedAlternateServes() {
    const reachPoints = this._upTo - 1;
    return reachedAlternateServes(
      this._team1Score.points,
      this._team2Score.points,
      reachPoints,
    );
  }

  private isEnds(): boolean {
    const lastGamePointHistory = this.getLastGamePointHistory();
    if (lastGamePointHistory.length === 0) {
      return false;
    }
    return this.isEndsFromTeamScoringLast(
      getLast(lastGamePointHistory).team1WonPoint,
    );
  }

  private isEndsFromTeamScoringLast(team1LastScored: boolean): boolean {
    return this.isLastGame() && this.isMidwayGame(team1LastScored);
  }

  private getMidwayPoints(team1: boolean): number {
    const startGameScore = team1
      ? this._team1StartGameScore
      : this._team2StartGameScore;
    const pointsToWin = this._upTo - startGameScore;
    return startGameScore + Math.floor(pointsToWin / 2);
  }

  private scoredMidwayFirstTime(
    scoringPointsWon: number,
    scoringMidwayPoints: number,
    otherPointsWon: number,
    otherMidwayPoints: number,
  ) {
    return (
      scoringPointsWon === scoringMidwayPoints &&
      otherPointsWon < otherMidwayPoints
    );
  }

  private isMidwayGame(team1LastScored: boolean): boolean {
    if (team1LastScored) {
      return this.scoredMidwayFirstTime(
        this._team1Score.points,
        this._team1MidwayPoints,
        this._team2Score.points,
        this._team2MidwayPoints,
      );
    } else {
      return this.scoredMidwayFirstTime(
        this._team2Score.points,
        this._team2MidwayPoints,
        this._team1Score.points,
        this._team1MidwayPoints,
      );
    }
  }

  private gamesPlayed(): number {
    return this._team1Score.games + this._team2Score.games;
  }

  private isLastGame(): boolean {
    return this.gamesPlayed() === this.bestOf - 1;
  }

  private getGameWonState(): GameWonState {
    const team1IsUpTo = this._team1Score.points >= this._upTo;
    const team2IsUpTo = this._team2Score.points >= this._upTo;
    const isUpTo = team1IsUpTo || team2IsUpTo;
    if (!isUpTo) {
      return GameWonState.NotWon;
    }
    const pointsDifference = Math.abs(
      this._team1Score.points - this._team2Score.points,
    );
    const clearBy = this._clearBy2 ? 2 : 1;
    if (pointsDifference < clearBy) {
      return GameWonState.NotWon;
    }
    return team1IsUpTo ? GameWonState.Team1Won : GameWonState.Team2Won;
  }

  private nextGame(team1Won: boolean): void {
    this._gameScores.push({
      team1Points: this._team1Score.points,
      team2Points: this._team2Score.points,
    });
    const teamScore = team1Won ? this._team1Score : this._team2Score;
    teamScore.games += 1;
    this._team1Score.points = this._team1StartGameScore;
    this._team2Score.points = this._team2StartGameScore;

    if (teamScore.games !== requiredGamesToWin(this.bestOf)) {
      this.switchEnds();
      this._pointHistory.push([]);
    }
  }
}
