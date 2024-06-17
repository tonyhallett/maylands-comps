import { getLast, isEven } from "./helpers";
import { MatchWinState, getMatchWinState } from "./getMatchWinState";
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

export interface MatchState {
  team1Left: boolean;
  team1Score: TeamScore;
  team2Score: TeamScore;
  server: Player | undefined;
  receiver: Player | undefined;
  remainingServes: number;
  matchWinState: MatchWinState;
  gameScores: ReadonlyArray<GameScore>;
  canUndoPoint: boolean;
  serverReceiverChoice: ServerReceiverChoice;
  pointHistory: ReadonlyArray<ReadonlyArray<PointHistory>>;
}

export type Team1Player = "Team1Player1" | "Team1Player2";
export type Team2Player = "Team2Player1" | "Team2Player2";
export type Player = Team1Player | Team2Player;
export interface TeamScore {
  games: number;
  points: number;
}

export interface GameScore {
  team1Points: number;
  team2Points: number;
}

interface CompetitionOptions {
  team1StartGameScore: number;
  team2StartGameScore: number;
  upTo: number;
  clearBy2: boolean;
  numServes: number;
}

enum GameWonState {
  NotWon,
  Team1Won,
  Team2Won,
}

export interface PointHistory {
  team1: boolean;
  date: Date;
}

export class Umpire {
  private get canUndoPoint(): boolean {
    return (
      this._pointHistory.length > 0 && this.getLastGamePointHistory().length > 0
    );
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
  }

  private undoGameWinScore() {
    this._pointHistory.pop();
    const lastGameScore = this._gameScores.pop();
    const lastPoint = this.removeLastPointHistory();
    const teamScoreToReduce = lastPoint.team1
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.games -= 1;
    this._team1Score.points = lastGameScore.team1Points;
    this._team2Score.points = lastGameScore.team2Points;
    teamScoreToReduce.points -= 1;
  }

  private undoMidGameState() {
    const lastPoint = this.removeLastPointHistory();
    if (this.isMidwayLastGame(lastPoint.team1)) {
      this.switchEnds();
      this.doublesEndsPointsScored = "NotEnds";
    }
    const teamScoreToReduce = lastPoint.team1
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
      this._team1Score.points === this.team1StartGameScore &&
      this._team2Score.points === this.team2StartGameScore
    );
  }
  private _pointHistory: PointHistory[][] = [[]];

  private get matchWinState(): MatchWinState {
    return getMatchWinState(
      {
        bestOf: this.bestOf,
        upTo: this._upTo,
        clearBy2: this.clearBy2,
      },
      this._team1Score,
      this._team2Score,
    );
  }

  private _gameScores: GameScore[] = [];
  private team1StartGameScore: number;
  private team2StartGameScore: number;

  private _upTo: number;

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
    return totalPoints - (this.team1StartGameScore + this.team2StartGameScore);
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
      return this.numServes;
    }
    const pointsScoredAfterInitialServer =
      pointsScored - this._remainingServesAtStartOfGame;
    return this.numServes - (pointsScoredAfterInitialServer % this.numServes);
  }
  private numServes: number;
  private dateProvider: () => Date = () => new Date();

  private clearBy2: boolean;
  private team1MidwayPoints: number;
  private team2MidwayPoints: number;
  private doublesEndsPointsScored: DoublesEndPointsScored | undefined;
  constructor(
    umpireOptions: CompetitionOptions,
    private readonly isDoubles: boolean,
    private readonly bestOf: number,
  ) {
    this.team1StartGameScore = umpireOptions.team1StartGameScore;
    this.team2StartGameScore = umpireOptions.team2StartGameScore;
    this._team1Score.points = this.team1StartGameScore;
    this._team2Score.points = this.team2StartGameScore;
    this.throwIfNotOdd(bestOf);
    this.throwIfNotMoreThan0(umpireOptions.numServes);
    this.numServes = umpireOptions.numServes;
    this.setRemainingServesAtStartOfGame();
    this._upTo = umpireOptions.upTo;
    this.clearBy2 = umpireOptions.clearBy2;
    this.team1MidwayPoints = this.getMidwayPoints(true);
    this.team2MidwayPoints = this.getMidwayPoints(false);
    this.doublesEndsPointsScored = this.isDoubles ? "NotEnds" : undefined;
  }

  private getServerReceiver(
    serverReceiverChoice: ServerReceiverChoice,
    matchWinState: MatchWinState,
  ): ServerReceiver {
    const serverReceiver: ServerReceiver = {
      server: undefined,
      receiver: undefined,
    };
    if (
      matchWinState === MatchWinState.Team1Won ||
      matchWinState === MatchWinState.Team2Won
    ) {
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
            this.team1StartGameScore +
            (this.team2Score.points - this.team2StartGameScore),
          alternateServesAt: this._upTo - 1,
          remainingServesAtStartOfGame: this._remainingServesAtStartOfGame,
          numServes: this.numServes,
        });
      }
    }
    return serverReceiver;
  }

  public getMatchState(): MatchState {
    const matchWinState = this.matchWinState;
    const serverReceiverChoice = this.serverReceiverChoice;
    const remainingServes = this.remainingServes;
    return {
      canUndoPoint: this.canUndoPoint,
      gameScores: this._gameScores,
      matchWinState,
      remainingServes,
      team1Left: this._team1Left,
      team1Score: this.team1Score,
      team2Score: this.team2Score,
      serverReceiverChoice,
      pointHistory: this._pointHistory,
      ...this.getServerReceiver(serverReceiverChoice, matchWinState),
    };
  }

  private setRemainingServesAtStartOfGame(): void {
    const totalStartScores =
      Math.abs(this.team1StartGameScore) + Math.abs(this.team2StartGameScore);

    this._remainingServesAtStartOfGame =
      this.numServes - (totalStartScores % this.numServes);
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

  switchEnds(): MatchState {
    this._team1Left = !this._team1Left;
    return this.getMatchState();
  }

  pointScored(team1: boolean): MatchState {
    this.addPoint(team1);
    if (this.isDoubles) {
      this.setDoublesEndsPoints(team1);
    }
    const gameWonState = this.getGameWonState();
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
      this.isMidwayLastGame(team1)
    ) {
      this.doublesEndsPointsScored = this.getPointsScored();
    }
  }

  private addPoint(team1: boolean) {
    this.addPointHistory(team1);
    this.incrementTeamPoints(team1);
  }

  private incrementTeamPoints(team1: boolean) {
    const teamScore = team1 ? this._team1Score : this._team2Score;
    teamScore.points += 1;
  }

  private addPointHistory(team1: boolean) {
    const date = this.dateProvider();
    this._pointHistory[this._pointHistory.length - 1].push({
      team1: team1,
      date,
    });
  }

  private pointScoredAndNotWon(team1: boolean) {
    const isMidwayLastGame = this.isMidwayLastGame(team1); // todo affects server and receiver for doubles
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

  private isMidwayLastGame(team1LastScored: boolean): boolean {
    return this.isLastGame() && this.isMidwayGame(team1LastScored);
  }

  private getMidwayPoints(team1: boolean): number {
    const startGameScore = team1
      ? this.team1StartGameScore
      : this.team2StartGameScore;
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
        this.team1MidwayPoints,
        this._team2Score.points,
        this.team2MidwayPoints,
      );
    } else {
      return this.scoredMidwayFirstTime(
        this._team2Score.points,
        this.team2MidwayPoints,
        this._team1Score.points,
        this.team1MidwayPoints,
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
    const clearBy = this.clearBy2 ? 2 : 1;
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
    this._team1Score.points = this.team1StartGameScore;
    this._team2Score.points = this.team2StartGameScore;

    if (teamScore.games !== requiredGamesToWin(this.bestOf)) {
      this.switchEnds();
      this._pointHistory.push([]);
    }
  }
}
