import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1>Maylands Competitions </h1>
        <Link to="routetest">Route test</Link>
      </div>
    ),
  },
  {
    path: "routetest",
    element: <div>It worked !</div>,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
