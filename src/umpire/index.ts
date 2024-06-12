import {
  MatchWinState,
  getMatchWinState,
  isEven,
  requiredGamesToWin,
} from "./helpers";

export type Team1Player = "Team1Player1" | "Team1Player2";
export type Team2Player = "Team2Player1" | "Team2Player2";
export type Player = Team1Player | Team2Player;
export interface TeamScore {
  gamesWon: number;
  pointsWon: number;
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

export interface ServerReceiverChoice {
  servers: Player[];
  firstGameDoublesReceivers: Player[];
}

export interface InitialServersReceiver {
  gameInitialServers: Player[];
  firstDoublesReceiver: Player | undefined; // as sufficient to determine the service cycle
}

export const availableServerReceiverChoice = (
  isDoubles: boolean,
  initialServersReceiver: InitialServersReceiver,
  gameNumber: number,
): ServerReceiverChoice => {
  const choice: ServerReceiverChoice = {
    firstGameDoublesReceivers: [],
    servers: [],
  };
  if (isDoubles) {
    // first game
    if (initialServersReceiver.gameInitialServers.length === 0) {
      choice.servers = [
        "Team1Player1",
        "Team1Player2",
        "Team2Player1",
        "Team2Player2",
      ];
      choice.firstGameDoublesReceivers = [];
    } else {
      if (gameNumber === 1) {
        choice.firstGameDoublesReceivers =
          initialServersReceiver.firstDoublesReceiver === undefined
            ? getDoublesOpponents(initialServersReceiver.gameInitialServers[0])
            : [];
      } else {
        const initialServerForGame =
          initialServersReceiver.gameInitialServers[gameNumber - 1];
        if (initialServerForGame === undefined) {
          const initialServerFromPreviousGame =
            initialServersReceiver.gameInitialServers[gameNumber - 2];
          choice.servers = getDoublesOpponents(initialServerFromPreviousGame);
        }
      }
    }
  } else {
    if (initialServersReceiver.gameInitialServers.length === 0) {
      choice.servers = ["Team1Player1", "Team2Player1"];
    }
  }
  return choice;
};

export class Umpire {
  get canUndoPoint(): boolean {
    return (
      this._pointHistory.length > 0 && this.getLastGamePointHistory().length > 0
    );
  }
  undoPoint() {
    if (this._pointHistory.length === 0) {
      throw new Error("No points to undo");
    }
    if (this.isStartOfGame()) {
      this.undoStartOfGameState();
    } else {
      this.undoMidGameState();
    }

    // don't need to undo the matchWinState/remainingServes as is calculated
  }

  private undoStartOfGameState() {
    this._pointHistory.pop();
    const lastGameScore = this._gameScores.pop();
    const lastGamePointHistory = this.getLastGamePointHistory();
    const lastPoint = lastGamePointHistory.pop();
    const teamScoreToReduce = lastPoint.team1
      ? this._team1Score
      : this._team2Score;
    teamScoreToReduce.gamesWon -= 1;
    this._team1Score.pointsWon = lastGameScore.team1Points;
    this._team2Score.pointsWon = lastGameScore.team2Points;
    teamScoreToReduce.pointsWon -= 1;
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
    teamScoreToReduce.pointsWon -= 1;
  }

  private getLastGamePointHistory(): PointHistory[] {
    return this._pointHistory[this._pointHistory.length - 1];
  }

  private isStartOfGame(): boolean {
    return (
      this._team1Score.pointsWon === this.team1StartGameScore &&
      this._team2Score.pointsWon === this.team2StartGameScore
    );
  }
  private doublesServiceCycle: [Player, Player][] = [];
  private _pointHistory: PointHistory[][] = [[]];
  public get matchWinState(): MatchWinState {
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
  public get pointHistory(): ReadonlyArray<ReadonlyArray<PointHistory>> {
    return this._pointHistory;
  }
  private _gameScores: GameScore[] = [];
  public get gameScores(): ReadonlyArray<GameScore> {
    return this._gameScores;
  }
  private team1StartGameScore: number;
  private team2StartGameScore: number;

  private _upTo: number;

  private _server: Player | undefined;
  public get server(): Player | undefined {
    return this._server;
  }

  private initialServersReceiver: InitialServersReceiver = {
    gameInitialServers: [],
    firstDoublesReceiver: undefined,
  };
  private _receiver: Player | undefined;
  public get receiver(): Player | undefined {
    return this._receiver;
  }
  private _team1Left: boolean = true;
  public get team1Left(): boolean {
    return this._team1Left;
  }
  public get serverReceiverChoice(): ServerReceiverChoice {
    return availableServerReceiverChoice(
      this.isDoubles,
      this.initialServersReceiver,
      this.gamesPlayed() + 1,
    );
  }

  private _team1Score: TeamScore = { gamesWon: 0, pointsWon: 0 };
  public get team1Score(): Readonly<TeamScore> {
    return { ...this._team1Score };
  }

  private _team2Score: TeamScore = { gamesWon: 0, pointsWon: 0 };
  public get team2Score(): Readonly<TeamScore> {
    return { ...this._team2Score };
  }

  private _remainingServesAtStartOfGame: number = 0;
  public get remainingServes(): number {
    if (this.reachedAlternateServes()) {
      return 1;
    }
    const totalPoints = this._team1Score.pointsWon + this._team2Score.pointsWon;
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

  constructor(
    umpireOptions: CompetitionOptions,
    private readonly isDoubles: boolean,
    public readonly bestOf: number,
  ) {
    this.team1StartGameScore = umpireOptions.team1StartGameScore;
    this.team2StartGameScore = umpireOptions.team2StartGameScore;
    this._team1Score.pointsWon = this.team1StartGameScore;
    this._team2Score.pointsWon = this.team2StartGameScore;
    this.throwIfNotOdd(bestOf);
    this.throwIfNotMoreThan0(umpireOptions.numServes);
    this.numServes = umpireOptions.numServes;
    this.setRemainingServesAtStartOfGame();
    this._upTo = umpireOptions.upTo;
    this.clearBy2 = umpireOptions.clearBy2;
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
    return this._team1Score.gamesWon === 0 && this._team2Score.gamesWon === 0;
  }

  private getDoublesServiceCycle(): [Player, Player][] {
    if (this.doublesServiceCycle.length == 0) {
      this.doublesServiceCycle.push([
        this.initialServersReceiver.gameInitialServers[0],
        this.initialServersReceiver.firstDoublesReceiver,
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

  setServer(player: Player): void {
    if (!this.serverReceiverChoice.servers.includes(player)) {
      throw new Error("Player not available");
    }
    this.initialServersReceiver.gameInitialServers.push(player);
    this._server = player;

    if (this.isDoubles) {
      if (!this.isFirstGame()) {
        this._receiver = this.getServerOfReceiverInPreviousGame(this._server);
      }
    } else {
      this._receiver = getSinglesOpponent(player);
    }
  }

  setFirstGameDoublesReceiver(player: Player): void {
    if (this.serverReceiverChoice.firstGameDoublesReceivers.includes(player)) {
      this._receiver = player;
      this.initialServersReceiver.firstDoublesReceiver = player;
    } else {
      throw new Error("receiver is not an available receiver");
    }
  }

  switchEnds(): void {
    this._team1Left = !this._team1Left;
  }

  changeOrderOfReceivingIfDoubles() {
    if (this.isDoubles) {
      this._receiver = getDoublesPartner(this._receiver);
    }
  }

  pointScored(team1: boolean): void {
    const date = this.dateProvider();
    this._pointHistory[this.pointHistory.length - 1].push({
      team1: team1,
      date,
    });
    const teamScore = team1 ? this._team1Score : this._team2Score;
    teamScore.pointsWon += 1;

    const gameWonState = this.getGameWonState();
    if (gameWonState === GameWonState.NotWon) {
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
      return;
    }
    this._gameScores.push({
      team1Points: this._team1Score.pointsWon,
      team2Points: this._team2Score.pointsWon,
    });
    this.nextGame(gameWonState === GameWonState.Team1Won);
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
    return (
      this._team1Score.pointsWon >= reachPoints &&
      this._team2Score.pointsWon >= reachPoints
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
    const team1MidwayPoints = this.getMidwayPoints(true);
    const team2MidwayPoints = this.getMidwayPoints(false);
    if (team1LastScored) {
      return this.scoredMidwayFirstTime(
        this._team1Score.pointsWon,
        team1MidwayPoints,
        this._team2Score.pointsWon,
        team2MidwayPoints,
      );
    } else {
      return this.scoredMidwayFirstTime(
        this._team2Score.pointsWon,
        team2MidwayPoints,
        this._team1Score.pointsWon,
        team1MidwayPoints,
      );
    }
  }

  private gamesPlayed(): number {
    return this._team1Score.gamesWon + this._team2Score.gamesWon;
  }
  private isLastGame(): boolean {
    return this.gamesPlayed() === this.bestOf - 1;
  }

  private getGameWonState(): GameWonState {
    const team1IsUpTo = this._team1Score.pointsWon >= this._upTo;
    const team2IsUpTo = this._team2Score.pointsWon >= this._upTo;
    const isUpTo = team1IsUpTo || team2IsUpTo;
    if (!isUpTo) {
      return GameWonState.NotWon;
    }
    const pointsDifference = Math.abs(
      this._team1Score.pointsWon - this._team2Score.pointsWon,
    );
    const clearBy = this.clearBy2 ? 2 : 1;
    if (pointsDifference < clearBy) {
      return GameWonState.NotWon;
    }
    return team1IsUpTo ? GameWonState.Team1Won : GameWonState.Team2Won;
  }

  private nextGame(team1Won: boolean): void {
    const teamScore = team1Won ? this._team1Score : this._team2Score;
    teamScore.gamesWon += 1;
    this._team1Score.pointsWon = this.team1StartGameScore;
    this._team2Score.pointsWon = this.team2StartGameScore;

    if (teamScore.gamesWon !== requiredGamesToWin(this.bestOf)) {
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
      const firstGameServer = this.initialServersReceiver.gameInitialServers[0];
      const firstGameReceiver = getSinglesOpponent(firstGameServer);
      this._server = firstGameServer;
      this._receiver = firstGameReceiver;
      if (!evenGamesPlayed) {
        this.switchServerReceiver();
      }
    }
  }
}

const isTeam1 = (player: Player): boolean => {
  return player === "Team1Player1" || player === "Team1Player2";
};

const getSinglesOpponent = (player: Player): Player => {
  return player === "Team1Player1" ? "Team2Player1" : "Team1Player1";
};

const getDoublesOpponents = (player: Player): Player[] => {
  return isTeam1(player)
    ? ["Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team1Player2"];
};

export function getPlayers(isDoubles: boolean): Player[] {
  return isDoubles
    ? ["Team1Player1", "Team1Player2", "Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team2Player1"];
}

export const getDoublesPartner = (player: string): Player => {
  switch (player) {
    case "Team1Player1":
      return "Team1Player2";
    case "Team1Player2":
      return "Team1Player1";
    case "Team2Player1":
      return "Team2Player2";
    case "Team2Player2":
      return "Team2Player1";
  }
};
