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
import { LeagueMatchViewRoute } from "./teamMatches/league/play/LeagueMatchViewRoute";
import { CreateLeagueSeasonForEmulator } from "./teamMatches/league/db-population/CreateLeagueSeasonForEmulator";
import { DemoCopyImageToClipboard } from "./DemoCopyImageToClipboard";

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
        <Link style={{ display: "block" }} href={leagueMatchesPath}>
          League matches
        </Link>
        <Link style={{ display: "block" }} href="democopyimagetoclipboard">
          Demo copy to clipboard
        </Link>
      </Box>
    ),
  },
  {
    path: "democopyimagetoclipboard",
    element: (
      <DemoCopyImageToClipboard
        useTrimmedSize
        getDisplaySize={(canvasSize) => {
          const maxHeight = 40;
          const ratio = canvasSize.width / canvasSize.height;
          return { width: ratio * maxHeight, height: maxHeight };
        }}
        signatureCanvasProps={{
          penColor: "#99a7ff",
          canvasProps: {
            style: {
              boxSizing: "border-box",
              display: "block",
              borderColor: "#99a7ff",
              borderWidth: 2,
              borderStyle: "solid",
              borderRadius: 2,
            },
          },
        }}
      />
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
    element: <LeagueMatchViewRoute />,
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
