export interface HandicapOptions {
  team1Handicap: number;
  team2Handicap: number;
  upTo: number;
}

export const shiftHandicap = (
  handicapOptions: HandicapOptions,
): HandicapOptions => {
  const minHandicap = Math.min(
    handicapOptions.team1Handicap,
    handicapOptions.team2Handicap,
  );
  const shift = minHandicap < 0 ? Math.abs(minHandicap) : 0;
  const team1Handicap = handicapOptions.team1Handicap + shift;
  const team2Handicap = handicapOptions.team2Handicap + shift;
  const upTo = handicapOptions.upTo + shift;
  return {
    team1Handicap,
    team2Handicap,
    upTo,
  };
};

const isEven = (value: number) => value % 2 === 0;

export type Player =
  | "Team1Player1"
  | "Team1Player2"
  | "Team2Player1"
  | "Team2Player2";
export interface TeamScore {
  gamesWon: number;
  pointsWon: number;
}

export interface GameScore {
  team1Points: number;
  team2Points: number;
}

export interface MatchState {
  team1StartGameScore: number;
  team2StartGameScore: number;
  adjustedUpTo: number;
  team1Left: boolean;
  team1Score: TeamScore;
  team2Score: TeamScore;
  availableServers: Player[];
  availableReceivers: Player[];
  server: Player | undefined;
  receiver: Player | undefined;
  isDoubles: boolean;
  bestOf: number;
}
interface CompetitionScoringOptions {
  upTo: number;
  team1StartGameScore: number;
  team2StartGameScore: number;
  clearBy2: boolean;
  numServes: number;
}

export function getPlayers(isDoubles: boolean): Player[] {
  return isDoubles
    ? ["Team1Player1", "Team1Player2", "Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team2Player1"];
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
  private _pointHistory: PointHistory[][] = [[]];
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

  private _initialServer: Player | undefined;
  private _server: Player | undefined;
  public get server(): Player | undefined {
    return this._server;
  }

  private _receiver: Player | undefined;
  public get receiver(): Player | undefined {
    return this._receiver;
  }
  private _team1Left: boolean = true;
  public get team1Left(): boolean {
    return this._team1Left;
  }
  private _availableServers: Player[];

  public get availableServers(): ReadonlyArray<Player> {
    return this._availableServers;
  }

  private _availableReceivers: Player[] = [];
  public get availableReceivers(): ReadonlyArray<Player> {
    return this._availableReceivers;
  }
  private _team1Score: TeamScore = { gamesWon: 0, pointsWon: 0 };
  public get team1Score(): Readonly<TeamScore> {
    return { ...this._team1Score };
  }

  private _team2Score: TeamScore = { gamesWon: 0, pointsWon: 0 };
  public get team2Score(): Readonly<TeamScore> {
    return { ...this._team2Score };
  }

  private _remainingServes: number = 0;
  public get remainingServes(): number {
    return this._remainingServes;
  }
  private numServes: number;
  private dateProvider: () => Date = () => new Date();

  private clearBy2: boolean;

  constructor(
    umpireOptions: CompetitionScoringOptions,
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
    this._remainingServes = umpireOptions.numServes;
    this._upTo = umpireOptions.upTo;
    this._availableServers = getPlayers(this.isDoubles);
    this.clearBy2 = umpireOptions.clearBy2;
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
  setServer(player: Player): void {
    if (!this._availableServers.includes(player)) {
      throw new Error("Player not available");
    }
    this._availableServers = [];
    this._server = player;
    this._initialServer = player;
    if (this.isDoubles) {
      if (this.isFirstGame()) {
        this._availableReceivers = this.getDoublesOpponents(player);
        this._receiver = undefined;
      } else {
        // have already overwritten the initial server but need receiver for order.
        throw new Error("not implemented");
      }
    } else {
      this._receiver = this.getSinglesOpponent(this._initialServer);
      this._remainingServes = this.numServes;
    }
  }

  setReceiver(player: Player): void {
    if (this._availableReceivers.includes(player)) {
      this._receiver = player;
      this._availableReceivers = [];
    } else {
      throw new Error("receiver is not an available receiver");
    }

    this._remainingServes = this.numServes;
  }

  switchEnds(): void {
    this._team1Left = !this._team1Left;
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
      this.determineMidgameServiceState();
      /*
        last possible game of a doubles match - 
        pair due to receive next shall change their order of receiving when first one pair scores 5 points.
      */

      const isMidwayLastGame = this.isMidwayLastGame(team1); // todo affects server and receiver for doubles
      if (isMidwayLastGame) {
        this.switchEnds();
      }
      return;
    }
    this._gameScores.push({
      team1Points: this._team1Score.pointsWon,
      team2Points: this._team2Score.pointsWon,
    });
    this.nextGame(gameWonState === GameWonState.Team1Won);
  }

  private resetRemainingServes() {
    this._remainingServes = this.numServes;
  }

  private determineMidgameServiceState(): void {
    this._remainingServes--;
    if (this._remainingServes === 0) {
      this.resetRemainingServes();
      if (this.isDoubles) {
        // previous receiver shall become the server and the partner of the previous server shall become the receiver
        const previousServer = this._server;
        this._server = this._receiver;
        this._receiver = this.getDoublesPartner(previousServer);
      } else {
        this.switchServerReceiver();
      }
    }

    /*
      not sure how to proceed as the rules are clear for 11 play
      "both players or pairs score 10 points... each player shall serve for only 1 point in turn.""

      do I take this to mean when clearBy2 then go to 1 serve when both are upTo - 1 ???

      when normal 11 this occurs on service change
    */
    if (this.reachedAlternateServes()) {
      this._remainingServes = 1;
    }
  }
  getDoublesPartner(previousServer: string): Player {
    switch (previousServer) {
      case "Team1Player1":
        return "Team1Player2";
      case "Team1Player2":
        return "Team1Player1";
      case "Team2Player1":
        return "Team2Player2";
      case "Team2Player2":
        return "Team2Player1";
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

  private isLastGame(): boolean {
    return (
      this._team1Score.gamesWon + this._team2Score.gamesWon === this.bestOf - 1
    );
  }

  private getGameWonState(): GameWonState {
    const team1IsUpTo = this._team1Score.pointsWon === this._upTo;
    const team2IsUpTo = this._team2Score.pointsWon === this._upTo;
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

    if (teamScore.gamesWon !== this.requiredGamesToWin()) {
      this.switchEnds();
      this.setNextGameServiceState();
      this._pointHistory.push([]);
    } else {
      this._server = undefined;
      this._receiver = undefined;
    }
  }

  private getSinglesOpponent(player: Player) {
    return player === "Team1Player1" ? "Team2Player1" : "Team1Player1";
  }

  private isTeam1(player: Player): boolean {
    return player === "Team1Player1" || player === "Team1Player2";
  }

  private getDoublesOpponents(player: Player): Player[] {
    return this.isTeam1(player)
      ? ["Team2Player1", "Team2Player2"]
      : ["Team1Player1", "Team1Player2"];
  }

  private setNextGameServiceState() {
    this.resetRemainingServes();
    if (this.isDoubles) {
      this._availableServers = this.getDoublesOpponents(this._initialServer);
      this._availableReceivers = [];
      this._server = undefined;
      this._receiver = undefined;
    } else {
      const numGamesPlayed =
        this._team1Score.gamesWon + this._team2Score.gamesWon;
      const evenNumberOfGamesPlayed = isEven(numGamesPlayed);
      this._server = this._initialServer;
      this._receiver = this.getSinglesOpponent(this._server);

      if (!evenNumberOfGamesPlayed) {
        this.switchServerReceiver();
      }
    }
  }

  private requiredGamesToWin(): number {
    return Math.ceil(this.bestOf / 2);
  }
}