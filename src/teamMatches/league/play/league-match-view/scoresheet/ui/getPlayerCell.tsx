import { TableCell } from "@mui/material";
import { TeamSelectionModel } from "../model/getMatchTeamsSelectionModel";
import { Player } from "../../../../../../umpire";
import { TeamConcededOrForfeited } from "../../../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";

export const getScoresheetGamePlayerCellAriaLabel = (isHome: boolean) => {
  return isHome ? "Home Team Player/s" : "Away Team Players";
};

export const getSimpleTeamDisplay = (
  teamSelectionDisplay: TeamSelectionModel,
) => {
  if (
    teamSelectionDisplay.player1 === undefined &&
    teamSelectionDisplay.player2 === undefined
  ) {
    return "?";
  }
  return teamSelectionDisplay.player2 === undefined
    ? teamSelectionDisplay.player1!
    : `${teamSelectionDisplay.player1!} ${teamSelectionDisplay.player2}`;
};
export const doublesPlayerAriaLabel = "Doubles Player";
export const unselectedPlayerCellColor = "#FC5B5B";
const getConcededOrForfeitedTextDecorationLine = (
  concededOrDefaulted: boolean,
): React.CSSProperties["textDecorationLine"] => {
  return concededOrDefaulted ? "line-through" : "none";
};
export const getPlayerCell = (
  teamSelectionModel: TeamSelectionModel,
  concededOrForfeited: TeamConcededOrForfeited,
  isHome: boolean,
  server: Player | undefined,
  receiver: Player | undefined,
) => {
  const ariaLabel = getScoresheetGamePlayerCellAriaLabel(isHome);
  if (!teamSelectionModel.selected) {
    const color = concededOrForfeited.forfeited
      ? "inherit"
      : unselectedPlayerCellColor;
    return (
      <TableCell
        sx={{
          color,
          textDecorationLine: getConcededOrForfeitedTextDecorationLine(
            concededOrForfeited.forfeited,
          ),
        }}
        aria-label={ariaLabel}
      >
        {getSimpleTeamDisplay(teamSelectionModel)}
      </TableCell>
    );
  }
  const getPlayer = (
    playerDisplay: string | undefined,
    isPlayer1: boolean,
    conceded: boolean,
    isDoubles: boolean,
  ) => {
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
    let textDecorationLine: React.CSSProperties["textDecorationLine"] = "none";
    if (!conceded) {
      textDecorationLine = isServer
        ? "underline"
        : isReceiver
          ? "overline"
          : "none";
    }
    const ariaLabel = isDoubles ? doublesPlayerAriaLabel : "Singles Player";
    return (
      <span aria-label={ariaLabel} style={{ textDecorationLine }}>
        {playerDisplay}
      </span>
    );
  };
  const conceded = concededOrForfeited.conceded;
  const isDoubles = teamSelectionModel.player2 !== undefined;
  return (
    <TableCell
      sx={{
        color: "inherit",
        textDecorationLine: getConcededOrForfeitedTextDecorationLine(conceded),
      }}
      aria-label={ariaLabel}
    >
      {getPlayer(teamSelectionModel.player1, true, conceded, isDoubles)}
      {getPlayer(teamSelectionModel.player2, false, conceded, isDoubles)}
    </TableCell>
  );
};
