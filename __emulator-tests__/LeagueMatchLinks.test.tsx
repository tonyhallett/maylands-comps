/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import { CreateLeagueSeason } from "../src/teamMatches/league/db-population/CreateLeagueSeason";
import createEmulatorTests from "./createEmulatorTests";
import { LeagueMatchLinks } from "../src/teamMatches/league/LeagueMatchLinks";
import { MaylandsFixture } from "../src/teamMatches/league/db-population/data/romfordLeagueData";
import { LinkProps } from "@mui/material";

// mocking otherwise have to set up the router
jest.mock("@mui/material/Link/Link", () => {
  return {
    default: function Link(props: LinkProps) {
      return <a href={props.href}>{props.children}</a>;
    },
  };
});

const getFixtures = (addToday = true) => {
  // todo - how can import when jest hoisted
  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const tomorrow = addDays(new Date(), 1);
  const maylandsFixturesToAdd: MaylandsFixture[] = addToday
    ? [
        {
          homeTeam: "Maylands Green 1",
          awayTeam: "Maylands Green 2",
          date: new Date(),
        },
      ]
    : [];
  maylandsFixturesToAdd.push({
    homeTeam: "Maylands Green 3",
    awayTeam: "Maylands Green 4",
    date: tomorrow,
  });
  return maylandsFixturesToAdd;
};
const { createMaylandsComps } = createEmulatorTests();

describe("<LeagueMatchLinks/>", () => {
  const createLeagueSeason = async (maylandsFixtures: MaylandsFixture[]) => {
    let resolver: () => void = () => {
      // do nothing
    };
    const waitForSetupDatabasePromise = new Promise<void>((resolve) => {
      resolver = resolve;
    });
    render(
      createMaylandsComps(
        <CreateLeagueSeason
          fixtures={maylandsFixtures}
          promiseCallback={(promise) => {
            promise.then(() => {
              resolver();
            });
          }}
        />,
      ),
    );
    await waitForSetupDatabasePromise;
  };

  it("should have play and watch links for today's fixtures", async () => {
    await createLeagueSeason(getFixtures());
    render(createMaylandsComps(<LeagueMatchLinks />));

    const mg1vMg2Card = await screen.findByLabelText(
      "Maylands Green 1 vs Maylands Green 2",
    );
    const playLink = within(mg1vMg2Card!).getByText("Play");
    const watchLink = within(mg1vMg2Card!).getByText("Watch");
    expect(playLink.tagName).toBe("A");
    expect(watchLink.tagName).toBe("A");
    // todo - check hrefs

    expect(
      screen.queryByLabelText("Maylands Green 3 vs Maylands Green 4"),
    ).toBeNull();
  });

  it("should notify if no league matches for today", async () => {
    await createLeagueSeason(getFixtures(false));
    render(createMaylandsComps(<LeagueMatchLinks />));

    expect(
      await screen.findByText("No league matches today"),
    ).toBeInTheDocument();
  });
});
