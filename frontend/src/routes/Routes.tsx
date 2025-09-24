import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import RepoDetailsPage from "../pages/RepoPage";
import FollowersPage from "../pages/FollowersPage";
import UserPage from "../pages/UserPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/repo/:username/repo/:reponame" element={<RepoDetailsPage />} />
      {/* <Route path="/followers/:username" element={<FollowersPage />} /> */}
      <Route path="/user/:username" element={<UserPage />} />
              <Route path="/user/:username/followers" element={<FollowersPage />} />

    </Routes>
  );
}
