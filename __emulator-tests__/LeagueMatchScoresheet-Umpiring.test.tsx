/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { PlayLeagueMatch } from "../src/teamMatches/league/play/league-match-view/PlayLeagueMatch";
import {
  SetupMatch,
  allPlayersSelected,
  defaultAwayPlayerNames,
  defaultHomePlayerNames,
  getMatchSetupThatSetsDefaultPlayersThatAreSelected,
  setupDatabase,
} from "./setupDatabase";
import createEmulatorTests from "./createEmulatorTests";
import { DbUmpireViewProps } from "../src/teamMatches/league/play/league-match-view/DbUmpireView";
import { MatchAndKey } from "../src/teamMatches/league/db-hooks/useLeagueMatchAndMatches";
import { UmpireMatchAndKey } from "../src/teamMatches/league/play/league-match-selection/renderScoresheet-type";
import { MatchState, Umpire } from "../src/umpire";
import { findGameMenuButton } from "./LeagueMatchScoresheetSelectors";
import { openMenuClickMenuItem } from "../test-helpers/mui/menu";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";

const mockDbUmpire = jest.fn();
jest.mock(
  "../src/teamMatches/league/play/league-match-view/DbUmpireView",
  () => {
    return {
      DbUmpireView: (props: DbUmpireViewProps) => mockDbUmpire(props),
    };
  },
);

interface RecreatedProps {
  umpire: Umpire;
  matchState: MatchState;
  key: string;
  dbMatch: DbMatch;
}
let mockRecreatedMatchesProps: RecreatedProps[] | undefined;
jest.mock(
  "../src/teamMatches/league/play/league-match-selection/addUmpireToMatchAndKeys",
  () => {
    return {
      addUmpireToMatchAndKeys: (
        matchAndKeys: MatchAndKey[],
      ): UmpireMatchAndKey[] => {
        mockRecreatedMatchesProps = [];
        return matchAndKeys.map((matchAndKey, i) => {
          const umpire = new Umpire(
            {
              bestOf: i + 1,
              clearBy2: false,
              numServes: 6,
              upTo: 99,
              team1StartGameScore: 1,
              team2StartGameScore: 2,
            },
            false,
          );
          const matchState = umpire.getMatchState();
          mockRecreatedMatchesProps!.push({
            umpire,
            matchState,
            key: matchAndKey.key,
            dbMatch: matchAndKey.match,
          });
          const umpireMatchAndKey: UmpireMatchAndKey = {
            ...matchAndKey,
            matchState: matchState,
            umpire: umpire,
          };
          return umpireMatchAndKey;
        });
      },
    };
  },
);

jest.mock("../src/teamMatches/league/play/LeagueMatchScoreboard", () => {
  return {
    LeagueMatchScoreboard: () => (
      <div data-testid="leaguematchscoreboard"></div>
    ),
  };
});

const { createMaylandsComps, database } = createEmulatorTests();

describe("LeagueMatchScoresheet-Umpiring", () => {
  function createApp(leagueMatchId: string) {
    return createMaylandsComps(
      <PlayLeagueMatch leagueMatchId={leagueMatchId} />,
    );
  }

  beforeAll(() => {
    Object.defineProperty(window.screen, "orientation", {
      value: {
        type: "portrait-primary",
        addEventListener: () => {
          // do nothing
        },
        removeEventListener: () => {
          // do nothing
        },
      },
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should not render the DbUmpireView until a game has been selected to umpire", async () => {
    const leagueMatchKey = await setupDatabase(
      database,
      getMatchSetupThatSetsDefaultPlayersThatAreSelected(
        allPlayersSelected,
        allPlayersSelected,
      ),
    );
    render(createApp(leagueMatchKey));

    expect(mockDbUmpire).not.toHaveBeenCalled();
  });

  const getDbUmpireProps = (callNumber: number) => {
    return mockDbUmpire.mock.calls[callNumber][0] as DbUmpireViewProps;
  };
  const clickUmpire = async (matchIndex: number) => {
    const menuButton = await findGameMenuButton(matchIndex);
    openMenuClickMenuItem(menuButton, "Umpire");
  };
  const setupDatabaseClickUmpireGetProps = async (
    matchIndex: number,
    setupMatch: SetupMatch,
  ) => {
    const leagueMatchKey = await setupDatabase(database, setupMatch);
    render(createApp(leagueMatchKey));

    await clickUmpire(matchIndex);

    expect(mockDbUmpire.mock.calls).toHaveLength(1);
    return getDbUmpireProps(0);
  };

  const singlesSetupMatch = getMatchSetupThatSetsDefaultPlayersThatAreSelected(
    allPlayersSelected,
    allPlayersSelected,
  );

  describe("should render the DbUmpireView when umpire game menu item is clicked with props", () => {
    it.each([0, 1])(
      "recreated Umpire,rules from umpire, matchState, match and key",
      async (matchIndex) => {
        const props = await setupDatabaseClickUmpireGetProps(
          matchIndex,
          getMatchSetupThatSetsDefaultPlayersThatAreSelected(
            allPlayersSelected,
            allPlayersSelected,
          ),
        );

        const umpireAndMatchState = mockRecreatedMatchesProps![matchIndex];
        const umpire = umpireAndMatchState.umpire;
        expect(props.umpire).toBe(umpireAndMatchState.umpire);
        expect(props.matchState).toBe(umpireAndMatchState.matchState);
        expect(props.matchKey).toBe(umpireAndMatchState.key);

        expect(props.dbMatch).toBe(umpireAndMatchState.dbMatch);
        expect(props.dbMatch.umpired).toBe(true);
        expect(props.rules).toEqual({
          bestOf: umpire.bestOf,
          upTo: umpire.upTo,
          clearBy2: umpire.clearBy2,
          numServes: umpire.numServes,
          team1EndsAt: umpire.team1MidwayPoints,
          team2EndsAt: umpire.team2MidwayPoints,
        });
      },
    );
    interface PlayerNamesTest {
      team1Player1Name: string;
      team2Player1Name: string;
      team1Player2Name: string | undefined;
      team2Player2Name: string | undefined;
      matchIndex: number;
      setupMatch: SetupMatch;
    }

    const playerNamesTests: PlayerNamesTest[] = [
      {
        matchIndex: 0,
        setupMatch: singlesSetupMatch,
        team1Player1Name: defaultHomePlayerNames[0],
        team2Player1Name: defaultAwayPlayerNames[0],
        team1Player2Name: undefined,
        team2Player2Name: undefined,
      },
      {
        matchIndex: 1,
        setupMatch: singlesSetupMatch,
        team1Player1Name: defaultHomePlayerNames[1],
        team2Player1Name: defaultAwayPlayerNames[1],
        team1Player2Name: undefined,
        team2Player2Name: undefined,
      },
      {
        matchIndex: 2,
        setupMatch: singlesSetupMatch,
        team1Player1Name: defaultHomePlayerNames[2],
        team2Player1Name: defaultAwayPlayerNames[2],
        team1Player2Name: undefined,
        team2Player2Name: undefined,
      },
      {
        matchIndex: 9,
        setupMatch: getMatchSetupThatSetsDefaultPlayersThatAreSelected(
          allPlayersSelected,
          allPlayersSelected,
          (doublesMatch) => {
            doublesMatch.team1Player1Id = defaultHomePlayerNames[0];
            doublesMatch.team1Player2Id = defaultHomePlayerNames[1];
            doublesMatch.team2Player1Id = defaultAwayPlayerNames[0];
            doublesMatch.team2Player2Id = defaultAwayPlayerNames[1];
          },
        ),
        team1Player1Name: defaultHomePlayerNames[0],
        team2Player1Name: defaultAwayPlayerNames[0],
        team1Player2Name: defaultHomePlayerNames[1],
        team2Player2Name: defaultAwayPlayerNames[1],
      },
    ];
    it.each(playerNamesTests)(
      "game $matchIndex should have player names",
      async ({
        matchIndex,
        setupMatch,
        team1Player1Name,
        team2Player1Name,
        team1Player2Name,
        team2Player2Name,
      }) => {
        const props = await setupDatabaseClickUmpireGetProps(
          matchIndex,
          setupMatch,
        );
        expect(props.team1Player1Name).toBe(team1Player1Name);
        expect(props.team2Player1Name).toBe(team2Player1Name);
        expect(props.team1Player2Name).toBe(team1Player2Name);
        expect(props.team2Player2Name).toBe(team2Player2Name);
      },
    );
  });

  it("should removed dbMatch.umpired if previously umpiring game", async () => {
    await setupDatabaseClickUmpireGetProps(0, singlesSetupMatch);

    expect(mockRecreatedMatchesProps![0].dbMatch.umpired).toBe(true);
    await clickUmpire(1);
    expect(mockRecreatedMatchesProps![0].dbMatch.umpired).toBeUndefined();
  });
});
