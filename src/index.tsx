import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DemoUmpire } from "./demoUmpire";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, CssBaseline, Link, Typography } from "@mui/material";
import MGLogo from "./MGLogo";
import DemoSetAndPointTopAlignment from "./fontDemos/DemoSetAndPointTopAlignment";
import MaylandsThemeProvider from "./MaylandsThemeProvider";
import DemoScoringCharts from "./charts/DemoScoringCharts";
import freeScoringRoute from "./freeScoring/route";

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
        <Link style={{ display: "block" }} href="demoumpire">
          Scoring demo
        </Link>
        <Link href="playerviewdemo">Player view demo</Link>
        <Link style={{ display: "block" }} href="demoscoringcharts">
          Demo scoring charts
        </Link>
      </Box>
    ),
  },
  {
    path: "demoumpire",
    element: (
      <Box p={1}>
        <DemoUmpire />
      </Box>
    ),
  },
  {
    path: "playerviewdemo",
    element: <DemoSetAndPointTopAlignment />,
  },
  {
    path: "demoscoringcharts",
    element: <DemoScoringCharts />,
  },
  freeScoringRoute,
]);

createRoot(document.getElementById("root")).render(
  <MaylandsThemeProvider>
    <CssBaseline enableColorScheme />
    <RouterProvider router={router} />
  </MaylandsThemeProvider>,
);
