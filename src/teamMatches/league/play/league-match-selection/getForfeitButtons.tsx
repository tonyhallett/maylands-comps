import { Button } from "@mui/material";
import { ForfeitActionType, TeamForfeitModel } from "./useForfeit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonIcon from "@mui/icons-material/Person";
const ForfeitIcon = PersonOffIcon;
const UndoForfeitIcon = PersonIcon;

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
    return (
      <Button
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
  return <div>{buttons}</div>;
}
