import {
  dbMatchSaveStateToSaveState,
  saveStateToDbMatchSaveState,
} from "../src/firebase/rtb/match/conversion";
import { SaveState, Umpire } from "../src/umpire";
import { InitialServersDoublesReceiver } from "../src/umpire/availableServerReceiverChoice";

describe("conversions", () => {
  function expectRoundTrip(saveState: SaveState) {
    const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
    expect(dbMatchSaveStateToSaveState(dbMatchSaveState)).toEqual(saveState);
  }

  describe("InitialServersDoublesReceiver", () => {
    it("should work with initial state", () => {
      const initialDoublesSaveState = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        true,
      ).getSaveState();
      expect(
        initialDoublesSaveState.initialServersDoublesReceiver,
      ).toEqual<InitialServersDoublesReceiver>({
        gameInitialServers: [],
        firstDoublesReceiver: undefined,
      });
      expectRoundTrip(initialDoublesSaveState);
    });
    it("should work with first game initial server", () => {
      const doublesSaveState = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        true,
      ).getSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
      );
      expectRoundTrip(doublesSaveState);
    });

    it("should work with first doubles receiver", () => {
      const doublesSaveState = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        true,
      ).getSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
      );
      doublesSaveState.initialServersDoublesReceiver.firstDoublesReceiver =
        "Team2Player1";
      expectRoundTrip(doublesSaveState);
    });

    it("should work with game initial servers of both teams", () => {
      const doublesSaveState = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        true,
      ).getSaveState();
      doublesSaveState.initialServersDoublesReceiver.gameInitialServers.push(
        "Team1Player1",
        "Team2Player1",
      );
      doublesSaveState.initialServersDoublesReceiver.firstDoublesReceiver =
        "Team2Player1";
      expectRoundTrip(doublesSaveState);
    });

    it("should work with repeated game initial servers", () => {
      const doublesSaveState = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        true,
      ).getSaveState();
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
