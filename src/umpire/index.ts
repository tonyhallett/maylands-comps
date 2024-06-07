type UmpireSettings = "handicap" | "hardbat" | "normal";

const umpireOptions: {
  [K in UmpireSettings]: UmpireOptions;
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
} as const;

export function getUmpire(id: UmpireSettings): Umpire {
  return new Umpire(umpireOptions[id]);
}

interface HandicapOptions {
  team1Handicap: number;
  team2Handicap: number;
  shiftNegatives: boolean;
}

type PossibleHandicapOptions = HandicapOptions | undefined;
type Player = "Team1Player1" | "Team1Player2" | "Team2Player1" | "Team2Player2";
interface TeamScore {
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
interface UmpireOptions {
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

export class Umpire {
  setInitialServer(player: Player): MatchState {
    if (!this.matchState.availableServers.includes(player)) {
      throw new Error("Player not available");
    }
    if (this.isDoubles) {
      const isTeam1 = player === "Team1Player1" || player === "Team1Player2";

      this.matchState = {
        ...this.matchState,
        availableServers: [],
        availableReceivers: isTeam1
          ? ["Team2Player1", "Team2Player2"]
          : ["Team1Player1", "Team1Player2"],
        server: player,
        receiver: undefined,
      };
    } else {
      this.matchState = {
        ...this.matchState,
        availableServers: [],
        server: player,
        receiver: player === "Team1Player1" ? "Team2Player1" : "Team1Player1",
      };
    }
    return this.matchState;
  }
  switchEnds(): MatchState {
    this.matchState = {
      ...this.matchState,
      team1Left: !this.matchState.team1Left,
    };
    return this.matchState;
  }
  private isDoubles: boolean;

  private matchState: MatchState;

  constructor(private umpireOptions: UmpireOptions) {}

  public initialize(
    isDoubles: boolean,
    bestOf: number, // https://stackoverflow.com/questions/68038912/only-odd-numbers-type-for-typescript
    handicapOptions?: HandicapOptions, // or should this be start scores
  ): MatchState {
    this.throwIfNotOdd(bestOf);
    this.isDoubles = isDoubles; // this needs to go on matchState
    const nonHandicapMatchState = {
      team1StartGameScore: 0,
      team2StartGameScore: 0,
      team1Score: { gamesWon: 0, pointsWon: 0 },
      team2Score: { gamesWon: 0, pointsWon: 0 },
      adjustedUpTo: this.umpireOptions.upTo,
      team1Left: true,
      availableServers: this.getAvailablePlayers(),
      availableReceivers: [],
      isDoubles,
      bestOf,
      server: undefined,
      receiver: undefined,
    };
    this.checkAndApplyHandicapOptions(nonHandicapMatchState, handicapOptions);

    return this.matchState;
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

  private getAvailablePlayers(): Player[] {
    return getPlayers(this.isDoubles);
  }

  private checkAndApplyHandicapOptions(
    matchState: MatchState,
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
      matchState.team1StartGameScore = handicaps.team1Handicap + shift;
      matchState.team2StartGameScore = handicaps.team2Handicap + shift;
      matchState.team1Score.pointsWon = matchState.team1StartGameScore;
      matchState.team2Score.pointsWon = matchState.team2StartGameScore;
      matchState.adjustedUpTo = this.umpireOptions.upTo + shift;
    }
    this.matchState = matchState;
  }
}
