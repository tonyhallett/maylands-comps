import { Button } from "@mui/material";
import { ForfeitActionType, TeamForfeitModel } from "./useForfeit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonIcon from "@mui/icons-material/Person";
const ForfeitIcon = PersonOffIcon;
const UndoForfeitIcon = PersonIcon;

export const getTeamForfeitButtonsContainerAriaLabel = (isHome: boolean) =>
  `${isHome ? "home" : "away"} forfeit or undo forfeit buttons`;
const getIcon = (forfeitActionType: ForfeitActionType) => {
  return forfeitActionType === ForfeitActionType.forfeit ? (
    <ForfeitIcon />
  ) : (
    <UndoForfeitIcon />
  );
};
export function getForfeitButtons(
  teamForfeitModel: TeamForfeitModel,
  isHome: boolean,
) {
  const identifierGameForfeitModels = [...teamForfeitModel.singles];
  if (teamForfeitModel.doubles) {
    identifierGameForfeitModels.push({
      ...teamForfeitModel.doubles,
      identifier: "D",
    });
  }
  const buttons = identifierGameForfeitModels.map((gameForfeitModel) => {
    const forfeitOrUndoAriaLabelPrefix = `${gameForfeitModel.forfeitActionType === ForfeitActionType.forfeit ? "" : "undo "}forfeit`;
    const identifier =
      gameForfeitModel.identifier === "D"
        ? "doubles"
        : `player ${gameForfeitModel.identifier}`;
    const ariaLabel = `${forfeitOrUndoAriaLabelPrefix} ${identifier}`;
    return (
      <Button
        aria-label={ariaLabel}
        endIcon={getIcon(gameForfeitModel.forfeitActionType)}
        key={`${isHome ? "H" : "A"}${gameForfeitModel.identifier}`}
        onClick={gameForfeitModel.act}
      >
        {`${gameForfeitModel.identifier}`}
      </Button>
    );
  });
  if (buttons.length === 0) {
    return null;
  }
  return (
    <div aria-label={getTeamForfeitButtonsContainerAriaLabel(isHome)}>
      {buttons}
    </div>
  );
}
