/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";
import { getDbMatchSaveStateFromUmpire } from "../src/teamMatches/league/helpers";
import {
  DbUmpireView,
  UmpireViewPropsNoUmpire,
} from "../src/teamMatches/league/play/league-match-view/DbUmpireView";
import { getRulesFromUmpire } from "../src/teamMatches/league/play/league-match-view/getUmpireViewInfo";
import { Umpire } from "../src/umpire";
import { ControllableUmpire, UmpireViewProps } from "../src/umpireView";
import createEmulatorTests from "../__tests__/createEmulatorTests";
import { Database } from "@firebase/database";

let mockUpdateMatch: DbMatch | undefined;
let mockUpdateKey: string | undefined;
let mockUpdateUmpire: Umpire | undefined;
let mockUpdateDb: Database;
let updateMatchFromUmpireMs: number | undefined;
let mockUpdatePromise: Promise<void> | undefined;
jest.mock<
  typeof import("../src/teamMatches/league/play/league-match-view/updateMatchFromUmpire")
>(
  "../src/teamMatches/league/play/league-match-view/updateMatchFromUmpire",
  () => {
    return {
      updateMatchFromUmpire(dbMatch, key, umpire, db) {
        updateMatchFromUmpireMs = new Date().getMilliseconds();
        mockUpdateMatch = dbMatch;
        mockUpdateKey = key;
        mockUpdateUmpire = umpire;
        mockUpdateDb = db;
        const resolved = Promise.resolve();
        mockUpdatePromise = resolved;
        return resolved;
      },
    };
  },
);
let mockUmpireViewProps: UmpireViewProps | undefined;
jest.mock("../src/umpireView", () => {
  return {
    UmpireView: (props: UmpireViewProps) => {
      mockUmpireViewProps = props;
      return <div />;
    },
  };
});

const { createMaylandsComps, database } = createEmulatorTests();
describe("<DbUmpireView/>", () => {
  const renderGetProps = () => {
    const umpire = new Umpire(
      {
        bestOf: 3,
        clearBy2: true,
        numServes: 5,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        upTo: 21,
      },
      false,
    );
    const umpireViewPropsNoUmpire: UmpireViewPropsNoUmpire = {
      autoShowServerReceiverChooser: true,
      serverReceiverTop: true,
      rules: getRulesFromUmpire(umpire),
      team1Player1Name: "team1Player1Name",
      team2Player1Name: "team2Player1Name",
      team1Player2Name: "team1Player2Name",
      team2Player2Name: "team2Player2Name",
      matchState: umpire.getMatchState(),
    };

    const dbMatch: DbMatch = {
      ...getDbMatchSaveStateFromUmpire(umpire),
      scoreboardWithUmpire: true,
    };
    const matchKey = "123";
    render(
      createMaylandsComps(
        <DbUmpireView
          matchKey={matchKey}
          umpire={umpire}
          dbMatch={dbMatch}
          {...umpireViewPropsNoUmpire}
        />,
      ),
    );
    return {
      umpire,
      umpireViewPropsNoUmpire,
      dbMatch,
      matchKey,
    };
  };
  it("should render an UmpireView", () => {
    const { umpireViewPropsNoUmpire } = renderGetProps();

    expect(mockUmpireViewProps).toEqual(
      expect.objectContaining(umpireViewPropsNoUmpire),
    );
  });

  describe("should call the umpire method then updateMatchFromUmpire", () => {
    interface UmpireMethodTest {
      umpireMethod: keyof ControllableUmpire;
      umpireMethodArgs: unknown[];
    }

    interface UmpireMethodTestT<T extends keyof ControllableUmpire> {
      umpireMethod: T;
      umpireMethodArgs: Parameters<ControllableUmpire[T]>;
    }
    const pointScoredHomeTest: UmpireMethodTestT<"pointScored"> = {
      umpireMethod: "pointScored",
      umpireMethodArgs: [true],
    };
    const pointScoredAwayTest: UmpireMethodTestT<"pointScored"> = {
      umpireMethod: "pointScored",
      umpireMethodArgs: [false],
    };
    const resetServerReceiverTest: UmpireMethodTestT<"resetServerReceiver"> = {
      umpireMethod: "resetServerReceiver",
      umpireMethodArgs: [],
    };
    const setFirstGameDoublesReceiverTest: UmpireMethodTestT<"setFirstGameDoublesReceiver"> =
      {
        umpireMethod: "setFirstGameDoublesReceiver",
        umpireMethodArgs: ["Team2Player1"],
      };
    const setServerTest: UmpireMethodTestT<"setServer"> = {
      umpireMethod: "setServer",
      umpireMethodArgs: ["Team2Player1"],
    };
    const switchEndsTest: UmpireMethodTestT<"switchEnds"> = {
      umpireMethod: "switchEnds",
      umpireMethodArgs: [],
    };
    const undoPointTest: UmpireMethodTestT<"undoPoint"> = {
      umpireMethod: "undoPoint",
      umpireMethodArgs: [],
    };
    const umpireMethodTests: UmpireMethodTest[] = [
      pointScoredHomeTest,
      pointScoredAwayTest,
      resetServerReceiverTest,
      setFirstGameDoublesReceiverTest,
      setServerTest,
      switchEndsTest,
      undoPointTest,
    ];
    it.each(umpireMethodTests)(
      "$umpireMethod",
      async ({ umpireMethod, umpireMethodArgs }) => {
        const { umpire, dbMatch, matchKey } = renderGetProps();
        const { fn, ms } = fnWithMs();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        umpire[umpireMethod] = fn as unknown as any;

        const umpireControllerMethod = mockUmpireViewProps!.umpire![
          umpireMethod
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as unknown as any;
        if (umpireMethodArgs.length === 0) {
          umpireControllerMethod();
        } else {
          umpireControllerMethod(...umpireMethodArgs);
        }

        await mockUpdatePromise;

        if (umpireMethodArgs.length === 0) {
          expect(fn).toHaveBeenCalled();
        } else {
          expect(fn).toHaveBeenCalledWith(...umpireMethodArgs);
        }
        expect(mockUpdateMatch).toEqual(dbMatch);
        expect(mockUpdateKey).toEqual(matchKey);
        expect(mockUpdateUmpire).toEqual(umpire);
        expect(mockUpdateDb).toEqual(database);
        expect(ms).toBeLessThanOrEqual(updateMatchFromUmpireMs!);
      },
    );
  });

  const fnWithMs = () => {
    const fnWithMs = {
      fn: jest.fn(() => {
        fnWithMs.ms = new Date().getMilliseconds();
      }),
      ms: 0,
    };
    return fnWithMs;
  };
});
