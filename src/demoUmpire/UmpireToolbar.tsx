import {
  Box,
  Card,
  Divider,
  IconButton,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import ServerReceiverIcon from "../ServerReceiverIcon";
import { getContrastingPaletteColor } from "./getContrastingPaletteColor";
import RuleIcon from "@mui/icons-material/Rule";
import { useState } from "react";
import { MatchOptions } from "../umpire";
import { CarbonBatButton } from "./CarbonBatButton";
import EndsIcon from "@mui/icons-material/TransferWithinAStation";
export interface UmpireToolbarProps {
  canScorePoint: boolean;
  scorePoint: (isLeft: boolean) => void;
  canUndoPoint: boolean;
  undoPoint: () => void;
  canResetServerReceiver: boolean;
  resetServerReceiver: () => void;
  rules: RulesViewProps;
  switchEnds: () => void;
}

type RulesViewProps = Omit<
  MatchOptions,
  "team1StartGameScore" | "team2StartGameScore"
>;
function RulesView({ clearBy2, numServes, upTo, bestOf }: RulesViewProps) {
  const clearBy = clearBy2 ? 2 : 1;
  return (
    <Box p={1} border={1} borderRadius={1}>
      <Typography>{`Best of ${bestOf}`}</Typography>
      <Typography>{`Up to ${upTo}`}</Typography>
      <Typography>{`${numServes} serves`}</Typography>
      <Typography>{`Clear by ${clearBy}`}</Typography>
    </Box>
  );
}

export function UmpireToolbar({
  canUndoPoint,
  undoPoint,
  canScorePoint,
  scorePoint,
  canResetServerReceiver,
  resetServerReceiver,
  rules,
  switchEnds,
}: UmpireToolbarProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const rulesClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const rulesPopoverClosed = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
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
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={rulesPopoverClosed}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <RulesView {...rules} />
      </Popover>
      <Card variant="outlined">
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            sx={{ border: 1, borderRadius: 1, m: 1 }}
            disabled={!canResetServerReceiver}
            onClick={() => resetServerReceiver()}
          >
            <ServerReceiverIcon />
          </IconButton>
          <IconButton
            sx={{ border: 1, borderRadius: 1, m: 1 }}
            onClick={() => switchEnds()}
          >
            <EndsIcon />
          </IconButton>
          <IconButton
            sx={{ border: 1, borderRadius: 1, m: 1 }}
            onClick={rulesClicked}
          >
            <RuleIcon />
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
    </>
  );
}
