import { getLast, isEven } from "./helpers";
import { MatchWinState, getMatchWinState } from "./getMatchWinState";
import { requiredGamesToWin } from "./requiredGamesToWin";
import {
  InitialServersDoublesReceiver,
  ServerReceiverChoice,
  availableServerReceiverChoice,
} from "./availableServerReceiverChoice";
import { reachedAlternateServes } from "./reachedAlternateServes";
import { getDoublesPartner, getSinglesOpponent } from "./playersHelpers";
import { ServerReceiver } from "./commonTypes";
import { getInitialServerReceiverForGame } from "./getInitialServerReceiverForGame";
import { getServerReceiver } from "./getServerReceiver";

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
    this._pointHistory.pop();
    const lastGameScore = this._gameScores.pop();
    const lastGamePointHistory = this.getLastGamePointHistory();
    const lastPoint = lastGamePointHistory.pop();
    const teamScoreToReduce = lastPoint.team1
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.games -= 1;
    this._team1Score.points = lastGameScore.team1Points;
    this._team2Score.points = lastGameScore.team2Points;
    teamScoreToReduce.points -= 1;
    this.switchEnds();
  }

  private undoMidGameState() {
    const currentGamePointHistory = this.getLastGamePointHistory();
    const lastPoint = currentGamePointHistory.pop();
    if (this.isMidwayLastGame(lastPoint.team1)) {
      this.switchEnds();
    }
    const teamScoreToReduce = lastPoint.team1
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.points -= 1;
  }

  private getLastGamePointHistory(): PointHistory[] {
    return this._pointHistory[this._pointHistory.length - 1];
  }

  private isStartOfGame(): boolean {
    return (
      this._team1Score.points === this.team1StartGameScore &&
      this._team2Score.points === this.team2StartGameScore
    );
  }
  private doublesServiceCycle: [Player, Player][] = [];
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

  private _server: Player | undefined;

  private initialServersDoublesReceiver: InitialServersDoublesReceiver = {
    gameInitialServers: [],
    firstDoublesReceiver: undefined,
  };
  private _receiver: Player | undefined;
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

  private _remainingServesAtStartOfGame: number = 0;
  private get remainingServes(): number {
    if (this.reachedAlternateServes()) {
      return 1;
    }
    const totalPoints = this._team1Score.points + this._team2Score.points;
    const pointsScored =
      totalPoints - (this.team1StartGameScore + this.team2StartGameScore);
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
  }

  private getServerReceiver(
    serverReceiverChoice: ServerReceiverChoice,
    remainingServes: number,
  ): ServerReceiver {
    const serverReceiver: ServerReceiver = {
      server: undefined,
      receiver: undefined,
    };
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
          endsInfo: this.isDoubles
            ? {
                isDecider: this.isLastGame(),
                team1MidwayPoints: this.team1MidwayPoints,
                team2MidwayPoints: this.team2MidwayPoints,
              }
            : undefined,
          team1Points: this.team1Score.points,
          team2Points: this.team2Score.points,
          pointsWon:
            this.team1Score.points -
            this.team1StartGameScore +
            (this.team2Score.points - this.team2StartGameScore),
          alternateServesAt: this._upTo - 1,
          remainingServesAtStartOfGame: remainingServes,
          numServes: this.numServes,
        });
      }
    }
    return serverReceiver;
  }

  public getMatchState(): MatchState {
    const serverReceiverChoice = this.serverReceiverChoice;
    const remainingServes = this.remainingServes;
    return {
      canUndoPoint: this.canUndoPoint,
      gameScores: this._gameScores,
      matchWinState: this.matchWinState,
      //receiver: this._receiver,
      remainingServes,
      //server: this._server,
      team1Left: this._team1Left,
      team1Score: this.team1Score,
      team2Score: this.team2Score,
      serverReceiverChoice,
      pointHistory: this._pointHistory,
      ...this.getServerReceiver(serverReceiverChoice, remainingServes),
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

  private isFirstGame(): boolean {
    return this._team1Score.games === 0 && this._team2Score.games === 0;
  }

  private getDoublesServiceCycle(): [Player, Player][] {
    if (this.doublesServiceCycle.length == 0) {
      this.doublesServiceCycle.push([
        this.initialServersDoublesReceiver.gameInitialServers[0],
        this.initialServersDoublesReceiver.firstDoublesReceiver,
      ]);
      for (let i = 0; i < 3; i++) {
        const previousServer = this.doublesServiceCycle[i][0];
        const previousReceiver = this.doublesServiceCycle[i][1];
        this.doublesServiceCycle.push(
          this.nextDoublesServerReceiver(previousServer, previousReceiver),
        );
      }
    }
    return this.doublesServiceCycle;
  }

  // first receiver shall be the player who served to him or her in the preceding game
  private getServerOfReceiverInPreviousGame(receiver: Player): Player {
    const serviceCycle = this.getDoublesServiceCycle();
    const gamesPlayed = this.gamesPlayed();
    const evenGamesPlayed = isEven(gamesPlayed);
    if (evenGamesPlayed) {
      for (let i = 0; i < serviceCycle.length; i++) {
        if (serviceCycle[i][0] === receiver) {
          return serviceCycle[i][1];
        }
      }
    } else {
      for (let i = 0; i < serviceCycle.length; i++) {
        if (serviceCycle[i][1] === receiver) {
          return serviceCycle[i][0];
        }
      }
    }
  }

  setServer(player: Player): MatchState {
    if (!this.serverReceiverChoice.servers.includes(player)) {
      throw new Error("Player not available");
    }
    this.initialServersDoublesReceiver.gameInitialServers.push(player);
    this._server = player;

    if (this.isDoubles) {
      if (!this.isFirstGame()) {
        this._receiver = this.getServerOfReceiverInPreviousGame(this._server);
      }
    } else {
      this._receiver = getSinglesOpponent(player);
    }
    return this.getMatchState();
  }

  setFirstGameDoublesReceiver(player: Player): MatchState {
    if (this.serverReceiverChoice.firstGameDoublesReceivers.includes(player)) {
      this._receiver = player;
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

  private changeOrderOfReceivingIfDoubles() {
    if (this.isDoubles) {
      this._receiver = getDoublesPartner(this._receiver);
    }
  }

  pointScored(team1: boolean): MatchState {
    const date = this.dateProvider();
    this._pointHistory[this._pointHistory.length - 1].push({
      team1: team1,
      date,
    });
    const teamScore = team1 ? this._team1Score : this._team2Score;
    teamScore.points += 1;

    const gameWonState = this.getGameWonState();
    if (gameWonState === GameWonState.NotWon) {
      this.pointScoredAndNotWon(team1);
    } else {
      this.nextGame(gameWonState === GameWonState.Team1Won);
    }

    return this.getMatchState();
  }

  private pointScoredAndNotWon(team1: boolean) {
    this.setMidgameServiceState();
    /*
        last possible game of a doubles match - 
        pair due to receive next shall change their order of receiving when first one pair scores 5 points.
      */

    const isMidwayLastGame = this.isMidwayLastGame(team1); // todo affects server and receiver for doubles
    if (isMidwayLastGame) {
      this.switchEnds();
      this.changeOrderOfReceivingIfDoubles();
    }
  }

  // previous receiver shall become the server and the partner of the previous server shall become the receiver
  private nextDoublesServerReceiver(
    currentServer: Player,
    currentReceiver: Player,
  ): [Player, Player] {
    return [currentReceiver, getDoublesPartner(currentServer)];
  }

  private shouldSwitchServerReceiver(): boolean {
    return this.reachedAlternateServes()
      ? true
      : this.remainingServes === this.numServes;
  }

  private setMidgameServiceState(): void {
    if (this.shouldSwitchServerReceiver()) {
      if (this.isDoubles) {
        const [newServer, newReceiver] = this.nextDoublesServerReceiver(
          this._server,
          this._receiver,
        );
        this._server = newServer;
        this._receiver = newReceiver;
      } else {
        this.switchServerReceiver();
      }
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

  private switchServerReceiver() {
    const currentServer = this._server;
    this._server = this._receiver;
    this._receiver = currentServer;
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
      this.setNextGameServiceState();
      this._pointHistory.push([]);
    } else {
      this._server = undefined;
      this._receiver = undefined;
    }
  }

  private setNextGameServiceState() {
    if (this.isDoubles) {
      this._server = undefined;
      this._receiver = undefined;
    } else {
      const evenGamesPlayed = isEven(this.gamesPlayed());
      const firstGameServer =
        this.initialServersDoublesReceiver.gameInitialServers[0];
      const firstGameReceiver = getSinglesOpponent(firstGameServer);
      this._server = firstGameServer;
      this._receiver = firstGameReceiver;
      if (!evenGamesPlayed) {
        this.switchServerReceiver();
      }
    }
  }
}
