import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { DemoUmpire } from "./demoUmpire";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1>Maylands Competitions </h1>
        <Link to="demoumpire">Scoring demo</Link>
      </div>
    ),
  },
  {
    path: "demoumpire",
    element: <DemoUmpire />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
