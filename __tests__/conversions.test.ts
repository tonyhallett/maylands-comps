import {
  dbMatchSaveStateToSaveState,
  saveStateToDbMatchSaveState,
} from "../src/firebase/rtb/match/conversion";
import { createUmpire } from "../src/teamMatches/league/helpers";
import { SaveState } from "../src/umpire";
import { InitialServersDoublesReceiver } from "../src/umpire/availableServerReceiverChoice";

describe("conversions", () => {
  function expectRoundTrip(saveState: SaveState) {
    const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
    expect(dbMatchSaveStateToSaveState(dbMatchSaveState)).toEqual(saveState);
  }

  describe("InitialServersDoublesReceiver", () => {
    const getInitialDoublesSaveState = () => createUmpire(true).getSaveState();
    it("should work with initial state", () => {
      const initialDoublesSaveState = getInitialDoublesSaveState();
      expect(
        initialDoublesSaveState.initialServersDoublesReceiver,
      ).toEqual<InitialServersDoublesReceiver>({
        gameInitialServers: [],
        firstDoublesReceiver: undefined,
      });
      expectRoundTrip(initialDoublesSaveState);
    });
    it("should work with first game initial server", () => {
      const doublesSaveState = getInitialDoublesSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
      );
      expectRoundTrip(doublesSaveState);
    });

    it("should work with first doubles receiver", () => {
      const doublesSaveState = getInitialDoublesSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
      );
      doublesSaveState.initialServersDoublesReceiver.firstDoublesReceiver =
        "Team2Player1";
      expectRoundTrip(doublesSaveState);
    });

    it("should work with game initial servers of both teams", () => {
      const doublesSaveState = getInitialDoublesSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
        "Team2Player1",
      );
      doublesSaveState.initialServersDoublesReceiver.firstDoublesReceiver =
        "Team2Player1";
      expectRoundTrip(doublesSaveState);
    });

    it("should work with repeated game initial servers", () => {
      const doublesSaveState = getInitialDoublesSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
        "Team2Player1",
        "Team1Player1",
      );
      doublesSaveState.initialServersDoublesReceiver.firstDoublesReceiver =
        "Team2Player1";
      expectRoundTrip(doublesSaveState);
    });
  });
});
