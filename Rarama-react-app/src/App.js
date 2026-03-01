import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ProgramList from "./components/ProgramList";
import ProgramDetails from "./components/ProgramDetails";
import SubjectList from "./components/SubjectList";
import SubjectDetails from "./components/SubjectDetails";

// Define routes using createBrowserRouter (for React Router v7)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/programs",
    element: <ProgramList />,
  },
  {
    path: "/programs/:programCode",
    element: <ProgramDetails />,
  },
  {
    path: "/subjects",
    element: <SubjectList />,
  },
  {
    path: "/subjects/:subjectCode",
    element: <SubjectDetails />,
  },
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;