/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { CreateLeagueSeason } from "../src/teamMatches/league/db-population/CreateLeagueSeason";
import createEmulatorTests from "./createEmulatorTests";
import { LeagueMatchLinks } from "../src/teamMatches/league/LeagueMatchLinks";
import { MaylandsFixture } from "../src/teamMatches/league/db-population/data/romfordLeagueData";
import { LinkProps } from "@mui/material";

// mocking otherwise have to set up the router
jest.mock("@mui/material/Link/Link", () => {
  return {
    default: function Link(props: LinkProps) {
      return <a href="">{props.children}</a>;
    },
  };
});

jest.mock(
  "../src/teamMatches/league/db-population/maylandsFixturesToAdd",
  () => {
    // todo - how can import when jest hoisted
    function addDays(date: Date, days: number) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    const tomorrow = addDays(new Date(), 1);
    const maylandsFixturesToAdd: MaylandsFixture[] = [
      {
        homeTeam: "Maylands Green 1",
        awayTeam: "Maylands Green 2",
        date: new Date(),
      },
      {
        homeTeam: "Maylands Green 3",
        awayTeam: "Maylands Green 4",
        date: tomorrow,
      },
    ];
    return {
      default: maylandsFixturesToAdd,
    };
  },
);

const { createMaylandsComps } = createEmulatorTests();

describe("<LeagueMatchLinks />", () => {
  beforeEach(async () => {
    let resolver: (value: void) => void = () => {};
    const waitForSetupDatabasePromise = new Promise<void>((resolve) => {
      resolver = resolve;
    });
    render(
      createMaylandsComps(
        <CreateLeagueSeason
          promiseCallback={(promise) => {
            promise.then(() => {
              resolver();
            });
          }}
        />,
      ),
    );
    await waitForSetupDatabasePromise;
  });

  it("should have some links for today's fixtures", async () => {
    render(createMaylandsComps(<LeagueMatchLinks />));

    await screen.findByText("Maylands Green 1 vs Maylands Green 2", {
      collapseWhitespace: true,
    });
    expect(
      screen.queryByText("Maylands Green 3 vs Maylands Green 4", {
        collapseWhitespace: true,
      }),
    ).toBeNull();
  });
});
