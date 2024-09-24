import { TableCell } from "@mui/material";
import { TeamSelectionDisplay } from "./getMatchTeamSelectionDisplays";

export const scoresheetGameHomePlayerAriaLabel = "Home Player";
export const scoresheetGameAwayPlayerAriaLabel = "Away Player";

export const getPlayerCell = (
  teamSelectionDisplay: TeamSelectionDisplay,
  isHome: boolean,
) => {
  return (
    <TableCell
      sx={{
        color: teamSelectionDisplay.selected ? "inherit" : "#FC5B5B",
      }}
      aria-label={
        isHome
          ? scoresheetGameHomePlayerAriaLabel
          : scoresheetGameAwayPlayerAriaLabel
      }
    >
      {teamSelectionDisplay.display}
    </TableCell>
  );
};
