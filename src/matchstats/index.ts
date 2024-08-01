import { GamePointHistory } from "../umpire";
import {
  GameMatchPointDeucesStats,
  GameMatchPointDeucesStatistician,
} from "./GameMatchPointDeucesStatistician";
import { LeadsStats, LeadStatistician } from "./LeadStatistician";
import {
  PointsBreakdownStats,
  PointsBreakdownStatistician,
} from "./PointsBreakdownStatistician";
import { StreaksStats, StreakStatistician } from "./StreakStatistician";
export { GamePointHistory } from "../umpire";

export interface GameStats {
  pointsBreakdown: PointsBreakdownStats;
  streaks: StreaksStats;
  gameMatchPoints?: GameMatchPointDeucesStats;
  leads: LeadsStats;
}

export function getGameStats(gamePointHistory: GamePointHistory): GameStats {
  const streakStatistician = new StreakStatistician();
  const leadStatistician = new LeadStatistician();
  const gameMatchPointDeucesStatistician =
    new GameMatchPointDeucesStatistician();
  const serviceReceiverRecordManager = new PointsBreakdownStatistician();
  gamePointHistory.forEach((point) => {
    streakStatistician.nextPoint(point);
    leadStatistician.nextPoint(point);
    gameMatchPointDeucesStatistician.nextPoint(point);
    serviceReceiverRecordManager.addPoint(point);
  });

  const gameStats: GameStats = {
    streaks: streakStatistician.getStats(),
    pointsBreakdown: serviceReceiverRecordManager.getStats(),
    leads: leadStatistician.getStats(),
  };

  const gameMatchPoints = gameMatchPointDeucesStatistician.getStats();
  if (gameMatchPoints !== undefined) {
    gameStats.gameMatchPoints = gameMatchPoints;
  }

  return gameStats;
}
