/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { LiveStreamingDialog } from "../src/teamMatches/league/play/league-match-view/LiveStreamingDialog";
describe("LiveStreamingDialog", () => {
  it("should render a select element", () => {
    const { getByRole } = render(
      <LiveStreamingDialog
        changed={() => {}}
        showLivestreamDialog
        setShowLivestreamDialog={() => {}}
        liveStreamAvailability={{
          free: [],
          tables: [],
          games: [],
        }}
      />,
    );
    getByRole("combobox");
  });
  xit("should have a Free option as the first if available", () => {});
  xit("should have a table option for each available table", () => {});
  xit("should have a game option for each available game", () => {});
});
