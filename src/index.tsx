import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, CssBaseline, Link, Typography } from "@mui/material";
import MGLogo from "./MaylandsTheming/MGSVGLogo";
import MaylandsThemeProvider from "./MaylandsTheming/MaylandsThemeProvider";
import freeScoringRoute from "./freeScoring/route";
import { DemoScoreDrawing } from "./fontDemos/DemoPlayerView/DemoScoreDrawing";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Box p={1}>
        <Typography variant="h5">Maylands Competitions </Typography>
        <MGLogo width={100} />
        <Link style={{ display: "block" }} href="freescoring">
          Free scoring
        </Link>
        <Link href="playerviewdemo">Player view demo</Link>
      </Box>
    ),
  },
  {
    path: "playerviewdemo",
    element: <DemoScoreDrawing />,
  },
  freeScoringRoute,
]);

createRoot(document.getElementById("root")).render(
  <MaylandsThemeProvider>
    <CssBaseline enableColorScheme />
    <RouterProvider router={router} />
  </MaylandsThemeProvider>,
);
