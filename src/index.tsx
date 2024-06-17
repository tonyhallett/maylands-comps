import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { DemoUmpire } from "./demoUmpire";
import ViewportDemo from "./demoUmpire/ViewportDemo";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";
// @ts-expect-error - this is a hack to get the svg file to be included in the bundle
import svg from "bundle-text:./MG Logo Clean.svg";

function T() {
  return <div dangerouslySetInnerHTML={{ __html: svg }}></div>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1>Maylands Competitions </h1>
        <div style={{ width: 100 }}>
          <T />
        </div>
        <Link style={{ display: "block" }} to="demoumpire">
          Scoring demo
        </Link>
        <Link to="playerviewdemo">Player view demo</Link>
      </div>
    ),
  },
  {
    path: "demoumpire",
    element: <DemoUmpire />,
  },
  {
    path: "playerviewdemo",
    element: <ViewportDemo />,
  },
]);

createRoot(document.getElementById("root")).render(
  <>
    <CssBaseline enableColorScheme />
    <RouterProvider router={router} />
  </>,
);
