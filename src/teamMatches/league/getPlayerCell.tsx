import { TableCell } from "@mui/material";
import { TeamSelectionDisplay } from "./getMatchTeamSelectionDisplays";
import { Player } from "../../umpire";

export const scoresheetGameHomePlayerAriaLabel = "Home Player";
export const scoresheetGameAwayPlayerAriaLabel = "Away Player";

export const getSimpleTeamDisplay = (
  teamSelectionDisplay: TeamSelectionDisplay,
) => {
  return teamSelectionDisplay.player2 === undefined
    ? teamSelectionDisplay.player1
    : `${teamSelectionDisplay.player1} ${teamSelectionDisplay.player2}`;
};

export const getPlayerCell = (
  teamSelectionDisplay: TeamSelectionDisplay,
  isHome: boolean,
  server: Player | undefined,
  receiver: Player | undefined,
) => {
  const ariaLabel = isHome
    ? scoresheetGameHomePlayerAriaLabel
    : scoresheetGameAwayPlayerAriaLabel;

  if (!teamSelectionDisplay.selected) {
    return (
      <TableCell
        sx={{
          color: "#FC5B5B",
        }}
        aria-label={ariaLabel}
      >
        {getSimpleTeamDisplay(teamSelectionDisplay)}
      </TableCell>
    );
  }
  const getPlayer = (playerDisplay: string | undefined, isPlayer1: boolean) => {
    if (playerDisplay === undefined) {
      return "";
    }
    const matchingPlayer: Player = isHome
      ? isPlayer1
        ? "Team1Player1"
        : "Team1Player2"
      : isPlayer1
        ? "Team2Player1"
        : "Team2Player2";

    const isServer = server === matchingPlayer;
    const isReceiver = receiver === matchingPlayer;
    const textDecorationLine: React.CSSProperties["textDecorationLine"] =
      isServer ? "underline" : isReceiver ? "overline" : "none";
    return (
      <span style={{ textDecorationLine: textDecorationLine }}>
        {playerDisplay}
      </span>
    );
  };
  return (
    <TableCell
      sx={{
        color: "inherit",
      }}
      aria-label={ariaLabel}
    >
      {getPlayer(teamSelectionDisplay.player1, true)}
      {getPlayer(teamSelectionDisplay.player2, false)}
    </TableCell>
  );
};
