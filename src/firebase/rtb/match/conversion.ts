import {
  GameScore,
  Player,
  SavePointHistory,
  SaveState,
} from "../../../umpire";
import { InitialServersDoublesReceiver } from "../../../umpire/availableServerReceiverChoice";
import { DoublesEndPoints } from "../../../umpire/getServerReceiver";

export type ObjectPointHistory = Record<
  string,
  "empty" | Record<string, SavePointHistory>
>;
export type ObjectGameScores = Record<string, GameScore>;

export interface DbInitialServersDoublesReceiver {
  gameInitialServers?: Player[];
  firstDoublesReceiver?: Player;
}
export type DBMatchSaveState = Omit<
  SaveState,
  | "pointHistory"
  | "gameScores"
  | "initialServersDoublesReceiver"
  | "doublesEndsPointsScored"
> & {
  pointHistory: ObjectPointHistory;
  gameScores?: ObjectGameScores;
  initialServersDoublesReceiver?: DbInitialServersDoublesReceiver;
  doublesEndsPointsScored?: DoublesEndPoints;
};

export function dbMatchSaveStateToSaveState(
  dbMatchSaveState: DBMatchSaveState,
): SaveState {
  const {
    pointHistory,
    gameScores,
    initialServersDoublesReceiver,
    doublesEndsPointsScored,
    ...rest
  } = dbMatchSaveState;
  const saveGameScores =
    gameScores === undefined ? [] : Object.values(gameScores);

  const savePointHistory = Object.values(pointHistory).map(
    (gamePointHistory) => {
      if (gamePointHistory === "empty") {
        return [] as SavePointHistory[];
      }
      return Object.values(gamePointHistory);
    },
  );
  let saveInitialServersDoublesReceiver: InitialServersDoublesReceiver;
  if (initialServersDoublesReceiver === undefined) {
    saveInitialServersDoublesReceiver = {
      gameInitialServers: [],
      firstDoublesReceiver: undefined,
    };
  } else {
    saveInitialServersDoublesReceiver = {
      gameInitialServers:
        initialServersDoublesReceiver.gameInitialServers === undefined
          ? []
          : initialServersDoublesReceiver.gameInitialServers,
      firstDoublesReceiver: initialServersDoublesReceiver.firstDoublesReceiver,
    };
  }
  return {
    ...rest,
    doublesEndsPointsScored,
    pointHistory: savePointHistory,
    gameScores: saveGameScores,
    initialServersDoublesReceiver: saveInitialServersDoublesReceiver,
  };
}

export function saveStateToDbMatchSaveState(
  saveState: SaveState,
): DBMatchSaveState {
  const {
    pointHistory,
    gameScores,
    initialServersDoublesReceiver,
    doublesEndsPointsScored,
    ...rest
  } = saveState;
  const dbInitialServersDoublesReceiver: DbInitialServersDoublesReceiver = {};
  if (initialServersDoublesReceiver.gameInitialServers.length > 0) {
    dbInitialServersDoublesReceiver.gameInitialServers =
      initialServersDoublesReceiver.gameInitialServers;
  }

  if (initialServersDoublesReceiver.firstDoublesReceiver !== undefined) {
    dbInitialServersDoublesReceiver.firstDoublesReceiver =
      initialServersDoublesReceiver.firstDoublesReceiver;
  }
  const dbMatchSaveState: DBMatchSaveState = {
    ...rest,
    gameScores: gameScores.reduce((acc, gameScore, gameIndex) => {
      acc[gameIndex.toString()] = gameScore;
      return acc;
    }, {}),
    pointHistory: pointHistory.reduce((acc, gamePointHistory, gameIndex) => {
      if (gamePointHistory.length > 0) {
        acc[gameIndex.toString()] = gamePointHistory.reduce(
          (acc, pointHistory, pointIndex) => {
            acc[pointIndex.toString()] = pointHistory;
            return acc;
          },
          {},
        );
      } else {
        acc[gameIndex.toString()] = "empty";
      }
      return acc;
    }, {}),
    initialServersDoublesReceiver: dbInitialServersDoublesReceiver,
  };
  if (doublesEndsPointsScored !== undefined) {
    dbMatchSaveState.doublesEndsPointsScored = doublesEndsPointsScored;
  }
  return dbMatchSaveState;
}
