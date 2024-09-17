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
import { DatabaseProvider } from "./firebase/rtb/rtbProvider";
import { LeagueMatchView } from "./teamMatches/league/LeagueMatchView";
import { CreateLeagueSeason } from "./teamMatches/league/CreateLeagueSeason";
import { LeagueMatchLinks } from "./teamMatches/league/LeagueMatchLinks";

const leagueMatchesPath = "leagueMatches";
const createLeagueSeasonPath = "createLeagueSeason";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Box p={1}>
        <Typography variant="h5">Maylands Competitions </Typography>
        <MGLogo width={100} />
        {/* <Link style={{ display: "block" }} href="freescoring">
          Free scoring
        </Link>
         */}
        {/*         <Link style={{ display: "block" }} href={createLeagueSeasonPath}>
          Create League Season
        </Link> */}
        <Link style={{ display: "block" }} href={leagueMatchesPath}>
          League matches
        </Link>
      </Box>
    ),
  },
  {
    path: createLeagueSeasonPath,
    element: <CreateLeagueSeason />,
  },
  {
    path: leagueMatchesPath,
    element: <LeagueMatchLinks />,
  },
  {
    path: `${leagueMatchesPath}/:leagueMatchId`,
    element: <LeagueMatchView />,
  },
  freeScoringRoute,
]);

createRoot(document.getElementById("root")!).render(
  <DatabaseProvider>
    <MaylandsThemeProvider>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </MaylandsThemeProvider>
  </DatabaseProvider>,
);
