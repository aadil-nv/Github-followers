import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import RepoDetailsPage from "../pages/RepoPage";
import UserPage from "../pages/UserPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/repo/:username/repo/:reponame" element={<RepoDetailsPage />} />
      <Route path="/user/:username" element={<UserPage />} />

    </Routes>
  );
}
