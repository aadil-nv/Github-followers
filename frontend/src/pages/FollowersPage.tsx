import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Add useParams
import type { RootState } from "../redux/store";
import { setUser, setRepos, setFollowers, pushHistory, popHistory } from "../features/githubSlice";

// User type matching your githubSlice
interface User {
  login: string;
  avatar_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  bio?: string;
  name?: string;
  location?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
  id?: number;
}

interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
}

// Follower response from GitHub API
interface FollowerResponse {
  login: string;
  avatar_url: string;
  id: number;
  url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
}

// User response from GitHub API (when fetching individual user)
interface UserResponse {
  login: string;
  avatar_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  bio?: string;
  name?: string;
  location?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
  id: number;
}

export default function FollowersPage(): React.ReactElement {
  const { username } = useParams<{ username: string }>(); // Get username from URL
//   const user = useSelector((state: RootState) => state.github.user);
  const followers = useSelector((state: RootState) => state.github.followers);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchFollowers = useCallback(async (targetUsername: string): Promise<void> => {
    try {
      // First, get the user data to get the followers_url
      const userRes = await fetch(`https://api.github.com/users/${targetUsername}`);
      if (!userRes.ok) {
        throw new Error(`HTTP error! status: ${userRes.status}`);
      }
      const userData: UserResponse = await userRes.json();
      
      // Then fetch followers
      const res = await fetch(userData.followers_url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: FollowerResponse[] = await res.json();
      
      // Convert FollowerResponse to User format for your slice
      const followersAsUsers: User[] = data.map((follower) => ({
        login: follower.login,
        avatar_url: follower.avatar_url,
        followers_url: follower.followers_url,
        following_url: follower.following_url,
        repos_url: follower.repos_url,
        id: follower.id,
      }));
      
      dispatch(setFollowers(followersAsUsers));
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(pushHistory("followers"));
    if (username) {
      void fetchFollowers(username);
    }
  }, [dispatch, fetchFollowers, username]);

  const handleFollowerClick = useCallback(async (follower: User): Promise<void> => {
    try {
      // fetch user info
      const userRes = await fetch(`https://api.github.com/users/${follower.login}/folollowers`);
      if (!userRes.ok) {
        throw new Error(`HTTP error! status: ${userRes.status}`);
      }
      const userData: UserResponse = await userRes.json();
      
      // Convert to User format for your slice
      const userForSlice: User = {
        login: userData.login,
        avatar_url: userData.avatar_url,
        followers_url: userData.followers_url,
        following_url: userData.following_url,
        repos_url: userData.repos_url,
        bio: userData.bio,
        name: userData.name,
        location: userData.location,
        followers: userData.followers,
        following: userData.following,
        public_repos: userData.public_repos,
        id: userData.id,
      };
      
      dispatch(setUser(userForSlice));

      // fetch repos
      const repoRes = await fetch(userData.repos_url);
      if (!repoRes.ok) {
        throw new Error(`HTTP error! status: ${repoRes.status}`);
      }
      const repos: Repo[] = await repoRes.json();
      dispatch(setRepos(repos));
      
      // Navigate to the clicked user's page
      navigate(`/user/${follower.login}`);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [dispatch, navigate]);

  const handleBack = useCallback((): void => {
    dispatch(popHistory());
    navigate(-1); // Go back in browser history
  }, [dispatch, navigate]);

  if (!username) {
    return <div>No username provided</div>;
  }

  return (
    <div className="p-4">
      <button
        onClick={handleBack}
        className="mb-4 bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition-colors"
        type="button"
      >
        Back
      </button>
      <h2 className="font-bold text-lg mb-2">Followers of {username}</h2>
      {followers.length === 0 ? (
        <p className="text-gray-500">No followers found</p>
      ) : (
        <ul className="space-y-2">
          {followers.map((follower: User) => (
            <li
              key={follower.login}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
              onClick={() => void handleFollowerClick(follower)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  void handleFollowerClick(follower);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <img
                src={follower.avatar_url}
                alt={`${follower.login} avatar`}
                className="w-8 h-8 rounded-full"
                loading="lazy"
              />
              <span>{follower.login}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}