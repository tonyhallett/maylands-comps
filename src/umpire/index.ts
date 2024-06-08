type Competitions = "handicap" | "hardbat" | "normal";

const competitionScoringOptions: {
  [K in Competitions]: CompetitionScoringOptions;
} = {
  handicap: {
    upTo: 31,
    clearBy2: false,
    numServes: 5,
    isHandicap: true,
  },
  hardbat: {
    upTo: 15,
    clearBy2: false,
    numServes: 2,
    isHandicap: false,
  },
  normal: {
    upTo: 11,
    clearBy2: true,
    numServes: 2,
    isHandicap: false,
  },
};

interface HandicapOptions {
  team1Handicap: number;
  team2Handicap: number;
  shiftNegatives: boolean;
}

type PossibleHandicapOptions = HandicapOptions | undefined;
export type Player =
  | "Team1Player1"
  | "Team1Player2"
  | "Team2Player1"
  | "Team2Player2";
export interface TeamScore {
  gamesWon: number;
  pointsWon: number;
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
  clearBy2: boolean;
  numServes: number;
  isHandicap: boolean;
}

export function getPlayers(isDoubles: boolean): Player[] {
  return isDoubles
    ? ["Team1Player1", "Team1Player2", "Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team2Player1"];
}

export function getUmpire(
  competition: Competitions,
  isDoubles: boolean,
  bestOf: number, // todo allow fixed number of games / unlimited
  handicapOptions?: PossibleHandicapOptions,
): Umpire {
  return new Umpire(
    competitionScoringOptions[competition],
    isDoubles,
    bestOf,
    handicapOptions,
  );
}

enum GameWonState {
  NotWon,
  Team1Won,
  Team2Won,
}

export class Umpire {
  private team1StartGameScore = 0;
  private team2StartGameScore = 0;

  private _upTo: number;
  public get upTo(): number {
    return this._upTo;
  }
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

  private switchedEndsInLastGame = false;

  constructor(
    private umpireOptions: CompetitionScoringOptions,
    private readonly isDoubles: boolean,
    public readonly bestOf: number,
    handicapOptions?: HandicapOptions,
  ) {
    this.throwIfNotOdd(bestOf);
    this._upTo = umpireOptions.upTo;
    this._availableServers = getPlayers(this.isDoubles);
    this.checkAndApplyHandicapOptions(handicapOptions);
  }

  private throwIfNotOdd(bestOf: number): void {
    if (bestOf % 2 === 0) {
      throw new Error("Best of must be an odd number");
    }
  }

  private throwIfNoHandicaps(handicaps: PossibleHandicapOptions): void {
    if (handicaps === undefined) {
      throw new Error(
        "Handicap compettition requires handicap options to be set.",
      );
    }
  }

  private checkAndApplyHandicapOptions(
    handicaps: PossibleHandicapOptions,
  ): void {
    if (this.umpireOptions.isHandicap) {
      this.throwIfNoHandicaps(handicaps);
      let shift = 0;
      if (handicaps.shiftNegatives) {
        const minHandicap = Math.min(
          handicaps.team1Handicap,
          handicaps.team2Handicap,
        );
        shift = minHandicap < 0 ? Math.abs(minHandicap) : 0;
      }
      this.team1StartGameScore = handicaps.team1Handicap + shift;
      this.team2StartGameScore = handicaps.team2Handicap + shift;
      this._team1Score.pointsWon = this.team1StartGameScore;
      this._team2Score.pointsWon = this.team2StartGameScore;
      this._upTo = this.umpireOptions.upTo + shift;
    }
  }

  setInitialServer(player: Player): void {
    if (!this._availableServers.includes(player)) {
      throw new Error("Player not available");
    }
    this._availableServers = [];
    this._server = player;
    if (this.isDoubles) {
      const isTeam1 = player === "Team1Player1" || player === "Team1Player2";

      this._availableReceivers = isTeam1
        ? ["Team2Player1", "Team2Player2"]
        : ["Team1Player1", "Team1Player2"];

      this._receiver = undefined;
    } else {
      this._receiver =
        player === "Team1Player1" ? "Team2Player1" : "Team1Player1";
    }
  }

  switchEnds(): void {
    this._team1Left = !this._team1Left;
  }

  pointScored(team1: boolean): void {
    const teamScore = team1 ? this._team1Score : this._team2Score;
    teamScore.pointsWon += 1;
    this.switchEndsIfMidwayLastGame();
    const gameWonState = this.getGameWonState();
    if (gameWonState === GameWonState.NotWon) {
      return;
    }
    this.nextGame(gameWonState === GameWonState.Team1Won);
  }

  private switchEndsIfMidwayLastGame(): void {
    if (!this.switchedEndsInLastGame && this.isMidwayLastGame()) {
      this.switchEnds();
      this.switchedEndsInLastGame = true;
    }
  }

  private isMidwayLastGame(): boolean {
    return this.isLastGame() && this.isMidwayGame();
  }

  private isMidwayGame(): boolean {
    const team1PointsToWin = this._upTo - this.team1StartGameScore;
    const team2PointsToWin = this._upTo - this.team2StartGameScore;
    const team1MidwayPoints =
      this.team1StartGameScore + Math.floor(team1PointsToWin / 2);
    const team2MidwayPoints =
      this.team2StartGameScore + Math.floor(team2PointsToWin / 2);
    return (
      this._team1Score.pointsWon === team1MidwayPoints ||
      this._team2Score.pointsWon === team2MidwayPoints
    );
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
    const clearBy = this.umpireOptions.clearBy2 ? 2 : 1;
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
    }
  }

  private requiredGamesToWin(): number {
    return Math.ceil(this.bestOf / 2);
  }
}
