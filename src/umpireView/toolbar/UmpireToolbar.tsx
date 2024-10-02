import {
  Box,
  Card,
  Divider,
  IconButton,
  Popover,
  useTheme,
} from "@mui/material";
import ServerReceiverIcon from "../icons/ServerReceiverIcon";
import { getContrastingPaletteColor } from "../../themeHelpers/getContrastingPaletteColor";
import RuleIcon from "@mui/icons-material/Rule";
import { useState } from "react";
import { CarbonBatButton } from "../iconButtons/CarbonBatButton";
import EndsIcon from "@mui/icons-material/TransferWithinAStation";
import { RulesView, RulesViewProps } from "./RulesView";

export interface ServerReceiverButtonProps {
  serverReceiverButtonEnabled: boolean;
  serverReceiverButtonClicked: () => void;
  serverReceiverButtonAriaLabel: string;
}
export interface UmpireToolbarProps extends ServerReceiverButtonProps {
  canScorePoint: boolean;
  scorePoint: (isLeft: boolean) => void;
  canUndoPoint: boolean;
  undoPoint: () => void;
  rules: RulesViewProps;
  switchEnds: () => void;
  showRules?: boolean;
}

export function UmpireToolbar({
  canUndoPoint,
  undoPoint,
  canScorePoint,
  scorePoint,
  serverReceiverButtonEnabled,
  serverReceiverButtonClicked,
  serverReceiverButtonAriaLabel,
  rules,
  switchEnds,
  showRules = false,
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
            aria-label={serverReceiverButtonAriaLabel}
            sx={{ border: 1, borderRadius: 1, m: 1 }}
            disabled={!serverReceiverButtonEnabled}
            onClick={() => serverReceiverButtonClicked()}
          >
            <ServerReceiverIcon />
          </IconButton>
          <IconButton
            sx={{ border: 1, borderRadius: 1, m: 1 }}
            onClick={() => switchEnds()}
          >
            <EndsIcon />
          </IconButton>
          {showRules && (
            <IconButton
              sx={{ border: 1, borderRadius: 1, m: 1 }}
              onClick={rulesClicked}
            >
              <RuleIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <CarbonBatButton
            ariaLabel="Score left"
            enabled={canScorePoint}
            clicked={() => scorePoint(true)}
            rubberFillColor={scoreRubberFillColor}
          />

          <CarbonBatButton
            ariaLabel="Undo point"
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
            ariaLabel="Score right"
            enabled={canScorePoint}
            clicked={() => scorePoint(false)}
            rubberFillColor={scoreRubberFillColor}
          />
        </div>
      </Card>
    </>
  );
}
