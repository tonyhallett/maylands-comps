import { styled } from "@mui/material";
export const ChartsTooltipPaper = styled("div", {
  name: "MuiChartsTooltip",
  slot: "Container",
})(({ theme }) => ({
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: theme.transitions.create("box-shadow"),
  borderRadius: theme.shape.borderRadius,
}));
