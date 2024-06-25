import { Box, Card, Divider, IconButton, useTheme } from "@mui/material";
import { BatButton, BatButtonProps } from "./BatButton";
import ServerReceiverEndsIcon from "../ServerReceiverEndsIcon";
import { getContrastingPaletteColor } from "./getContrastingPaletteColor";

type CarbonBatButtonProps = Omit<
  BatButtonProps,
  "bladeFillColor1" | "bladeFillColor2"
>;
function CarbonBatButton(props: CarbonBatButtonProps) {
  return (
    <BatButton bladeFillColor1="#3ce86a" bladeFillColor2="#A9A9A9" {...props} />
  );
}
export interface UmpireToolbarProps {
  canScorePoint: boolean;
  scorePoint: (isLeft: boolean) => void;
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
  canResetServerReceiver,
  resetServerReceiver,
}: UmpireToolbarProps) {
  const theme = useTheme();
  // todo - color cannot be a named color
  const getRubberFillColor = (enabled: boolean, color: string) => {
    return enabled ? color : theme.palette.action.disabled;
  };
  const contrastingSuccessColor = getContrastingPaletteColor(
    theme.palette.success,
    theme.palette.mode === "dark",
  );

  const contrastingErrorColor = getContrastingPaletteColor(
    theme.palette.error,
    theme.palette.mode === "dark",
  );

  const scoreRubberFillColor = getRubberFillColor(
    canScorePoint,
    contrastingSuccessColor,
  );
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
        <CarbonBatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(true)}
          rubberFillColor={scoreRubberFillColor}
        />

        <CarbonBatButton
          enabled={canUndoPoint}
          clicked={() => undoPoint()}
          rubberFillColor={getRubberFillColor(
            canUndoPoint,
            contrastingErrorColor,
          )}
          flip
          showBall={false}
        />
        <CarbonBatButton
          enabled={canScorePoint}
          clicked={() => scorePoint(false)}
          rubberFillColor={scoreRubberFillColor}
        />
      </div>
    </Card>
  );
}
