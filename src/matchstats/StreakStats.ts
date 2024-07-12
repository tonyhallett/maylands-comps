import { PointHistory } from "../umpire";

export interface TeamStreaks {
  streaks: number[];
  longestStreak: number;
}
export interface Streaks {
  team1: TeamStreaks;
  team2: TeamStreaks;
}
export interface StreaksInfo extends Streaks {
  team1Last: boolean | undefined;
}

export function getLongestStreak(streaks: number[]): number {
  if (streaks.length === 0) {
    return 0;
  }
  return Math.max(...streaks);
}

export class StreakStats {
  private streaks: StreaksInfo = {
    team1: { streaks: [], longestStreak: 0 },
    team2: { streaks: [], longestStreak: 0 },
    team1Last: undefined,
  };

  nextPoint = (point: PointHistory) => {
    const teamStreaks = point.team1WonPoint
      ? this.streaks.team1
      : this.streaks.team2;
    if (this.streaks.team1Last === undefined) {
      teamStreaks.streaks.push(1);
    } else {
      if (this.streaks.team1Last === point.team1WonPoint) {
        const streak = teamStreaks.streaks[teamStreaks.streaks.length - 1];
        teamStreaks.streaks[teamStreaks.streaks.length - 1] = streak + 1;
      } else {
        teamStreaks.streaks.push(1);
      }
    }
    this.streaks.team1Last = point.team1WonPoint;
  };
  getStats(): Streaks {
    this.streaks.team1.longestStreak = getLongestStreak(
      this.streaks.team1.streaks,
    );
    this.streaks.team2.longestStreak = getLongestStreak(
      this.streaks.team2.streaks,
    );

    return {
      team1: {
        streaks: this.streaks.team1.streaks,
        longestStreak: this.streaks.team1.longestStreak,
      },
      team2: {
        streaks: this.streaks.team2.streaks,
        longestStreak: this.streaks.team2.longestStreak,
      },
    };
  }
}
