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
import { CreateLeagueSeason } from "./teamMatches/league/db-population/CreateLeagueSeason";
import { LeagueMatchLinks } from "./teamMatches/league/LeagueMatchLinks";
import { PlayLeagueMatchRoute } from "./teamMatches/league/play/PlayLeagueMatchRoute";
import { WatchLeagueMatchRoute } from "./teamMatches/league/watch/WatchLeagueMatchRoute";
import { CreateLeagueSeasonForEmulator } from "./teamMatches/league/db-population/CreateLeagueSeasonForEmulator";
import { SubscribeMaylandsYoutubeButton } from "./SubscribeMaylandsYoutubeButton";
import { ShareButtons } from "./share-buttons/ShareButtons";

const leagueMatchesPath = "leagueMatches";
const createLeagueSeasonPath = "createLeagueSeason";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Box p={1}>
        <Typography variant="h5">Maylands Competitions</Typography>
        <MGLogo width={100} />
        <SubscribeMaylandsYoutubeButton />
        <ShareButtons />
        {/*         <Link style={{ display: "block" }} href="freescoring">
          Free scoring
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
    path: "setupemulator",
    element: <CreateLeagueSeasonForEmulator />,
  },
  {
    path: leagueMatchesPath,
    element: <LeagueMatchLinks />,
  },
  {
    path: `${leagueMatchesPath}/:leagueMatchId`,
    element: <PlayLeagueMatchRoute />,
  },
  {
    path: `watch/:leagueMatchId`,
    element: <WatchLeagueMatchRoute />,
  },
  freeScoringRoute,
]);
const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}
createRoot(root).render(
  <DatabaseProvider>
    <MaylandsThemeProvider>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </MaylandsThemeProvider>
  </DatabaseProvider>,
);
