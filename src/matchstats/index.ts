import { GamePointHistory } from "../umpire";
import { GameMatchPoints, GameMatchPointsStats } from "./GameMatchPointsStats";
import { Leads, LeadStats } from "./LeadStats";
import { PointsBreakdown, PointsBreakdownStats } from "./PointsBreakdownStats";
import { Streaks, StreakStats } from "./StreakStats";
export { GamePointHistory } from "../umpire";

export interface GameStats {
  pointsBreakdown: PointsBreakdown;
  streaks: Streaks;
  gameMatchPoints?: GameMatchPoints;
  leads?: Leads;
}

export function getGameStats(
  gamePointHistory: GamePointHistory,
  clearBy2 = true,
  upTo = 11,
): GameStats {
  const streakStats = new StreakStats();
  const leadStats = new LeadStats();
  const gameMatchPointStats = new GameMatchPointsStats(upTo, clearBy2);
  const serviceReceiverRecordManager = new PointsBreakdownStats();
  gamePointHistory.forEach((point) => {
    streakStats.nextPoint(point);
    leadStats.nextPoint(point);
    gameMatchPointStats.nextPoint(point);
    serviceReceiverRecordManager.addPoint(point);
  });

  const gameStats: GameStats = {
    streaks: streakStats.getStats(),
    pointsBreakdown: serviceReceiverRecordManager.getStats(),
  };

  const gameMatchPoints = gameMatchPointStats.getStats();
  if (gameMatchPoints !== undefined) {
    gameStats.gameMatchPoints = gameMatchPoints;
  }

  const leads = leadStats.getStats();
  if (leads !== undefined) {
    gameStats.leads = leads;
  }
  return gameStats;
}
