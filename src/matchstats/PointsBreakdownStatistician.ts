import { Player, PointHistory } from "../umpire";
import { ServerReceiver } from "../umpire/commonTypes";
import { isTeam1 } from "../umpire/playersHelpers";

type ServerReceiverRecord = [ServerReceiver, ServiceRecord];
class ServerReceiverMap<T> {
  private map = new Map<string, T>();
  private getKey(server: Player, receiver: Player) {
    return `${server}-${receiver}`;
  }
  private keyToServeReceiver(key: string): ServerReceiver {
    const [server, receiver] = key.split("-") as [Player, Player];
    return { server, receiver };
  }
  public set(server: Player, receiver: Player, value: T): void {
    this.map.set(this.getKey(server, receiver), value);
  }

  public get(server: Player, receiver: Player): T | undefined {
    return this.map.get(this.getKey(server, receiver));
  }
  public getAll(): [ServerReceiver, T][] {
    return Array.from(this.map.entries()).map(([key, value]) => {
      const serverReceiver = this.keyToServeReceiver(key);
      return [serverReceiver, value] as const;
    });
  }
}

interface ServiceRecord {
  numServes: number;
  numWonByServer: number;
}

// ---------------------------------------------------------------------------------
export interface ServeReceiveRecord {
  num: number;
  numWon: number;
  numLost: number;
  winPercentage: number | undefined;
}

export interface PlayerServeReceiveRecord extends ServeReceiveRecord {
  opponent: Player;
}

export interface PlayerPointsBreakdown extends ServeAndReceiveRecord {
  serverRecords: PlayerServeReceiveRecord[];
  receiverRecords: PlayerServeReceiveRecord[];
}

interface ServeAndReceiveRecord {
  serve: ServeReceiveRecord;
  receive: ServeReceiveRecord;
}

export interface TeamPointsBreakdown extends ServeAndReceiveRecord {
  pointsWon: number;
  pointsLost: number;
  pointWinPercentage: number | undefined;
  player1PointsBreakdown: PlayerPointsBreakdown;
  player2PointsBreakdown: PlayerPointsBreakdown;
}

export interface PointsBreakdownStats {
  team1: TeamPointsBreakdown;
  team2: TeamPointsBreakdown;
}

function getWinPercentage(numWon: number, num: number): number | undefined {
  if (num === 0) {
    return undefined;
  }
  return (numWon / num) * 100;
}

class PlayerPointsBreakdownImpl implements PlayerPointsBreakdown {
  constructor(player: Player, serverReceiverRecords: ServerReceiverRecord[]) {
    serverReceiverRecords.forEach(([serverReceiver, record]) => {
      const { server, receiver } = serverReceiver;
      if (server === player) {
        this.serverRecords.push({
          num: record.numServes,
          numWon: record.numWonByServer,
          numLost: record.numServes - record.numWonByServer,
          winPercentage: getWinPercentage(
            record.numWonByServer,
            record.numServes,
          ),
          opponent: receiver,
        });
      } else if (receiver === player) {
        this.receiverRecords.push({
          num: record.numServes,
          numWon: record.numServes - record.numWonByServer,
          numLost: record.numWonByServer,
          winPercentage: getWinPercentage(
            record.numServes - record.numWonByServer,
            record.numServes,
          ),
          opponent: server,
        });
      }
    });
    this.serve = new PlayerServeReceiveRecordImpl(this.serverRecords);
    this.receive = new PlayerServeReceiveRecordImpl(this.receiverRecords);
  }
  serverRecords: PlayerServeReceiveRecord[] = [];
  receiverRecords: PlayerServeReceiveRecord[] = [];
  serve: ServeReceiveRecord;
  receive: ServeReceiveRecord;
}

class PlayerServeReceiveRecordImpl implements ServeReceiveRecord {
  constructor(playerServeReceiveRecords: PlayerServeReceiveRecord[]) {
    playerServeReceiveRecords.forEach((record) => {
      this.num += record.num;
      this.numWon += record.numWon;
    });
    this.numLost = this.num - this.numWon;
    this.winPercentage = getWinPercentage(this.numWon, this.num);
  }
  num: number = 0;
  numWon: number = 0;
  numLost: number;
  winPercentage: number;
}

class TeamPointsBreakdownImpl implements TeamPointsBreakdown {
  constructor(isTeam1: boolean, serverReceiverRecords: ServerReceiverRecord[]) {
    this.player1PointsBreakdown = new PlayerPointsBreakdownImpl(
      isTeam1 ? "Team1Player1" : "Team2Player1",
      serverReceiverRecords,
    );

    this.player2PointsBreakdown = new PlayerPointsBreakdownImpl(
      isTeam1 ? "Team1Player2" : "Team2Player2",
      serverReceiverRecords,
    );
  }
  // todo cache the values
  get pointsWon(): number {
    return this.serve.numWon + this.receive.numWon;
  }
  get pointsLost(): number {
    return this.serve.numLost + this.receive.numLost;
  }
  get pointWinPercentage(): number {
    return getWinPercentage(this.pointsWon, this.pointsWon + this.pointsLost);
  }
  player1PointsBreakdown: PlayerPointsBreakdown;
  player2PointsBreakdown: PlayerPointsBreakdown;
  get serve(): ServeReceiveRecord {
    const numWon =
      this.player1PointsBreakdown.serve.numWon +
      this.player2PointsBreakdown.serve.numWon;
    const numLost =
      this.player1PointsBreakdown.serve.numLost +
      this.player2PointsBreakdown.serve.numLost;
    return {
      num: numWon + numLost,
      numWon,
      numLost,
      winPercentage: getWinPercentage(numWon, numWon + numLost),
    };
  }
  get receive(): ServeReceiveRecord {
    const numWon =
      this.player1PointsBreakdown.receive.numWon +
      this.player2PointsBreakdown.receive.numWon;
    const numLost =
      this.player1PointsBreakdown.receive.numLost +
      this.player2PointsBreakdown.receive.numLost;
    return {
      num: numWon + numLost,
      numWon,
      numLost,
      winPercentage: getWinPercentage(numWon, numWon + numLost),
    };
  }
}

export class PointsBreakdownStatistician {
  private serverReceiverMap = new ServerReceiverMap<ServiceRecord>();
  public addPoint(point: PointHistory) {
    const wonByServer = point.team1WonPoint
      ? isTeam1(point.server)
      : !isTeam1(point.server);
    const wonByServerIncrement = wonByServer ? 1 : 0;
    const serveReceiveRecord = this.serverReceiverMap.get(
      point.server,
      point.receiver,
    );
    if (serveReceiveRecord === undefined) {
      const newRecord = {
        numServes: 1,
        numWonByServer: wonByServerIncrement,
      };
      this.serverReceiverMap.set(point.server, point.receiver, newRecord);
    } else {
      serveReceiveRecord.numServes++;
      serveReceiveRecord.numWonByServer += wonByServerIncrement;
    }
  }
  getStats(): PointsBreakdownStats {
    const serverReceiverRecords = this.serverReceiverMap.getAll();
    return {
      team1: new TeamPointsBreakdownImpl(true, serverReceiverRecords),
      team2: new TeamPointsBreakdownImpl(false, serverReceiverRecords),
    };
  }
}
