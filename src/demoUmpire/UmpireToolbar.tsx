import { Box, Card, Divider, IconButton } from "@mui/material";
import { BatButton } from "./BatButton";
import ServerReceiverEndsIcon from "../ServerReceiverEndsIcon";

export interface UmpireToolbarProps {
  canScorePoint: boolean;
  scorePoint: (isLeft: boolean) => void;
  canUndoPoint: boolean;
  undoPoint: () => void;
  canResetServerReceiver: boolean;
  resetServerReceiver: () => void;
}

const green = "#3ce86a";
const lightGray = "#D3D3D3";
const gray = "#808080";
const darkGray = "#A9A9A9";
const orangeRed = "#FF4500";

export function UmpireToolbar({
  canUndoPoint,
  undoPoint,
  canScorePoint,
  scorePoint,
  canResetServerReceiver,
  resetServerReceiver,
}: UmpireToolbarProps) {
  return (
    <Card variant="outlined">
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <IconButton
          disabled={!canResetServerReceiver}
          onClick={() => resetServerReceiver()}
        >
          <ServerReceiverEndsIcon />
        </IconButton>
      </Box>
      <Divider />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <BatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(true)}
          rubberFillColor={canScorePoint ? green : lightGray}
          bladeFillColor1={gray}
          bladeFillColor2={darkGray}
        />

        <BatButton
          enabled={canUndoPoint}
          clicked={() => undoPoint()}
          rubberFillColor={canUndoPoint ? orangeRed : lightGray}
          bladeFillColor1={gray}
          bladeFillColor2={darkGray}
          flip
          showBall={false}
        />
        <BatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(false)}
          rubberFillColor={canScorePoint ? green : lightGray}
          bladeFillColor1={gray}
          bladeFillColor2={darkGray}
        />
      </div>
    </Card>
  );
}
