import { Box, Card, IconButton } from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import UndoIcon from "@mui/icons-material/Undo";
import AnimationIcon from "@mui/icons-material/Animation";
import { BatButton } from "./BatButton";

export interface UmpireToolbarProps {
  canScorePoint: boolean;
  scorePoint: (isLeft: boolean) => void;
  switchEnds: () => void;
  canUndoPoint: boolean;
  undoPoint: () => void;
  canResetServerReceiver: boolean;
  resetServerReceiver: () => void;
}
export function UmpireToolbar({
  canUndoPoint,
  undoPoint,
  canScorePoint,
  scorePoint,
  switchEnds,
  canResetServerReceiver,
  resetServerReceiver,
}: UmpireToolbarProps) {
  const batButtonSize = 24;
  return (
    <Card variant="outlined">
      <Box m={1}>
        <IconButton
          disabled={!canResetServerReceiver}
          onClick={() => resetServerReceiver()}
        >
          <AnimationIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            switchEnds();
          }}
        >
          <SwitchAccountIcon />
        </IconButton>
      </Box>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <BatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(true)}
          fontSize={batButtonSize}
        />

        <IconButton
          disabled={!canUndoPoint}
          onClick={() => {
            undoPoint();
          }}
        >
          <UndoIcon />
        </IconButton>
        <BatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(false)}
          fontSize={batButtonSize}
        />
      </div>
    </Card>
  );
}
