import {
  matchWonColor,
  notLeadingColor,
  unassailableColor,
  winningMatchColor,
} from "./colors";
import {
  LeadType,
  LeagueMatchResult,
  LeagueMatchResultState,
} from "../model/getLeagueMatchResultModel";
import { getLeagueMatchResultTeamElementAriaLabel } from "../../LeagueMatchView";

export const leadingLeagueMatchResultStateColorLookup = new Map<
  LeagueMatchResultState,
  string
>([
  [LeagueMatchResultState.InProgress, winningMatchColor],
  [LeagueMatchResultState.Unassailable, unassailableColor],
  [LeagueMatchResultState.Completed, matchWonColor],
]);

export const getMatchResultDisplay = (leagueMatchResult: LeagueMatchResult) => {
  const getTeamResult = (isHome: boolean) => {
    const teamLeagueMatchResult = isHome
      ? leagueMatchResult.home
      : leagueMatchResult.away;

    const teamColor =
      teamLeagueMatchResult.leadType === LeadType.Winning
        ? leadingLeagueMatchResultStateColorLookup.get(leagueMatchResult.state)!
        : notLeadingColor;
    return (
      <span
        aria-label={getLeagueMatchResultTeamElementAriaLabel(isHome)}
        style={{ color: teamColor, whiteSpace: "nowrap" }}
      >
        {teamLeagueMatchResult.score}
      </span>
    );
  };

  return (
    <>
      {getTeamResult(true)}
      <span style={{ whiteSpace: "nowrap" }}> - </span>
      {getTeamResult(false)}
    </>
  );
};
