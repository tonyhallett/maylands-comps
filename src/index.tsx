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
import { DatabaseProvider } from "./firebase/rtbProvider";
import {
  DemoCreateMatch,
  DemoDbPlayersView,
  DemoDbUmpire,
} from "./firebaseDemos/demos";
import { DemoTeamsMatchPlayersSelect } from "./teamMatches/teamMatchPlayerSelect";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Box p={1}>
        <Typography variant="h5">Maylands Competitions </Typography>
        <MGLogo width={100} />
        <Link style={{ display: "block" }} href="demoteammatchplayersselect">
          Demo team match players select
        </Link>
        {/* <Link style={{ display: "block" }} href="freescoring">
          Free scoring
        </Link>
         */}
        <Link style={{ display: "block" }} href="democreatematch">
          Demo create match
        </Link>
        <Link style={{ display: "block" }} href="demodbumpire">
          Demo umpire
        </Link>
        <Link style={{ display: "block" }} href="demodbscore">
          Demo scoreboard
        </Link>
      </Box>
    ),
  },
  {
    path: "demoteammatchplayersselect",
    element: <DemoTeamsMatchPlayersSelect />,
  },
  {
    path: "democreatematch",
    element: <DemoCreateMatch />,
  },

  {
    path: "demodbumpire",
    element: <DemoDbUmpire />,
  },
  {
    path: "demodbscore",
    element: <DemoDbPlayersView />,
  },

  freeScoringRoute,
]);

createRoot(document.getElementById("root")).render(
  <DatabaseProvider>
    <MaylandsThemeProvider>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </MaylandsThemeProvider>
  </DatabaseProvider>,
);
