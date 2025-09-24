import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type{ Follower, GitHubUser, GitHubRepo, UserToSave, BackendUser } from "../features/types";

export default function FollowersPage(): React.ReactElement {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingFollowerLogin, setLoadingFollowerLogin] = useState<string | null>(null);

  // Fetch followers from GitHub API
  const fetchFollowers = useCallback(async (userLogin: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const followersUrl = `https://api.github.com/users/${userLogin}/followers`;
      console.log("Fetching followers from:", followersUrl);
      
      const response = await axios.get<Follower[]>(followersUrl);
      console.log("Fetched followers:", response.data);
      
      setFollowers(response.data || []);
      
    } catch (err) {
      console.error('Error fetching followers:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError('GitHub API rate limit exceeded. Please try again later.');
        } else if (err.response?.status === 404) {
          setError('User not found on GitHub or has no public followers.');
        } else {
          setError(`Failed to fetch followers: ${err.response?.statusText || 'Unknown error'}`);
        }
      } else {
        setError('Failed to fetch followers');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle follower click - FIXED VERSION
  const handleFollowerClick = useCallback(async (followerLogin: string): Promise<void> => {
    console.log("🔄 Follower clicked:", followerLogin);
    
    if (!followerLogin?.trim()) {
      console.error("Invalid follower login provided");
      return;
    }

    // Prevent multiple simultaneous clicks
    if (loadingFollowerLogin) {
      console.log("Already loading a follower, ignoring click");
      return;
    }

    try {
      setLoadingFollowerLogin(followerLogin);
      console.log("🔍 Starting search for follower:", followerLogin);

      // First, try to get user from backend database
      try {
        console.log("🗄️ Checking backend database...");
        const backendResponse = await axios.get<BackendUser>(`http://localhost:5000/users/name/${followerLogin}`);
        
        if (backendResponse.data) {
          console.log("✅ Follower found in database:", backendResponse.data);
          console.log("🧭 Navigating to user page...");
          navigate(`/user/${followerLogin}`);
          return;
        }
      } catch (backendError) {
        if (axios.isAxiosError(backendError) && backendError.response?.status === 404) {
          console.log("ℹ️ Follower not found in database, will fetch from GitHub");
        } else {
          console.warn("⚠️ Database error (continuing with GitHub API):", backendError);
        }
      }

      // If not found in database, fetch from GitHub API
      console.log("🐙 Fetching follower from GitHub API...");
      const githubUserResponse = await axios.get<GitHubUser>(`https://api.github.com/users/${followerLogin}`);
      const githubUserData = githubUserResponse.data;
      
      if (!githubUserData) {
        throw new Error('No user data received from GitHub API');
      }
      
      console.log("✅ GitHub user data received:", githubUserData.login);
      
      // Fetch repositories
      let reposData: GitHubRepo[] = [];
      try {
        console.log("📦 Fetching repositories...");
        const reposResponse = await axios.get<GitHubRepo[]>(githubUserData.repos_url);
        reposData = reposResponse.data || [];
        console.log(`✅ Found ${reposData.length} repositories`);
      } catch (reposError) {
        console.warn("⚠️ Could not fetch repositories (continuing without them):", reposError);
      }

      const userToSave: UserToSave = {
        login: githubUserData.login,
        avatar_url: githubUserData.avatar_url,
        followers_url: githubUserData.followers_url,
        following_url: githubUserData.following_url,
        repos_url: githubUserData.repos_url,
        bio: githubUserData.bio,
        username: githubUserData.login,
        location: githubUserData.location,
        company: githubUserData.company,
        blog: githubUserData.blog,
        email: githubUserData.email,
        hireable: githubUserData.hireable,
        public_repos: githubUserData.public_repos,
        public_gists: githubUserData.public_gists,
        followers: githubUserData.followers,
        following: githubUserData.following,
        created_at: githubUserData.created_at,
        updated_at: githubUserData.updated_at,
        repos: reposData.map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          html_url: repo.html_url,
          language: repo.language,
        }))
      };

      // Save user to backend database
      try {
        console.log("💾 Saving user to database...");
        await axios.post('http://localhost:5000/users', userToSave);
        console.log("✅ User data saved to database successfully");
      } catch (saveError) {
        console.warn("⚠️ Error saving user to database (continuing anyway):", saveError);
      }

      // Navigate to user page
      console.log("🧭 Navigating to user page:", `/user/${followerLogin}`);
      navigate(`/user/${followerLogin}`);

    } catch (error) {
      console.error("❌ Error in handleFollowerClick:", error);

      let errorMessage = "An unexpected error occurred";
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = `User "${followerLogin}" not found on GitHub`;
        } else if (error.response?.status === 403) {
          errorMessage = "GitHub API rate limit exceeded. Please try again later.";
        } else {
          errorMessage = `GitHub API error: ${error.response?.statusText || 'Unknown error'}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoadingFollowerLogin(null);
    }
  }, [navigate, loadingFollowerLogin]);

  // Load followers data when component mounts
  useEffect(() => {
    if (username) {
      console.log("Username from URL params:", username);
      fetchFollowers(username);
    } else {
      console.error("No username provided in URL params");
      setError('No username provided');
      setIsLoading(false);
    }
  }, [username, fetchFollowers]);

  const handleBack = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://github.com/identicons/default.png';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>Loading followers...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          type="button"
        >
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Please try again later or check if the user exists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={handleBack}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        type="button"
      >
        ← Back
      </button>

      {/* Followers Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Followers of @{username} ({followers.length.toLocaleString()})
          </h1>
        </div>
        
        {followers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No followers found</p>
            <p className="text-gray-400 text-sm">
              This user either has no followers or their followers are not public.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {followers.map((follower) => (
              <div
                key={follower.login}
                className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
                  loadingFollowerLogin === follower.login
                    ? 'cursor-wait opacity-50 bg-blue-50 border-blue-200'
                    : 'cursor-pointer hover:shadow-md hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Card clicked for follower:", follower.login);
                  handleFollowerClick(follower.login);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFollowerClick(follower.login);
                  }
                }}
              >
                <img
                  src={follower.avatar_url}
                  alt={`${follower.login} avatar`}
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {follower.login}
                  </p>
                  <p className="text-sm text-gray-500">
                    {loadingFollowerLogin === follower.login ? 'Loading...' : 'Click to view profile'}
                  </p>
                </div>
                {loadingFollowerLogin === follower.login && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}