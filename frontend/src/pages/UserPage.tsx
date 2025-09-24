import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type{ BackendUser, User, Repo } from "../features/types";

export default function UserPage(): React.ReactElement {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transform backend user data to frontend user format
  const transformUserData = (backendUser: BackendUser): User => {
    return {
      login: backendUser.username,
      avatar_url: backendUser.avatar_url,
      name: backendUser.username, // Using username as display name
      location: backendUser.location,
      bio: backendUser.bio,
      followers: backendUser.followers,
      following: backendUser.following,
      public_repos: backendUser.public_repos,
    };
  };

  // Fetch repositories from GitHub API
  const fetchRepositories = useCallback(async (name: string): Promise<Repo[]> => {
    try {
      console.log(`Fetching repositories for: ${name}`);
      const response = await axios.get<Repo[]>(`https://api.github.com/users/${name}/repos`);
      console.log("Fetched repositories:", response.data);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching repositories:', err);
      return [];
    }
  }, []);

  // Fetch user data from backend
  const fetchUserData = useCallback(async (name: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching user data for: ${name}`);
      
      // Fetch user data
      const userResponse = await axios.get<BackendUser>(`http://localhost:5000/users/name/${name}`);
      console.log("API Response:", userResponse.data);
      
      const backendUser = userResponse.data;
      const transformedUser = transformUserData(backendUser);
      console.log("Transformed user data:", transformedUser);
      
      setUser(transformedUser);
      
      // Fetch repositories separately
      const userRepos = await fetchRepositories(name);
      setRepos(userRepos);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError(`User "${name}" not found`);
        } else if (err.response?.status === 500) {
          setError('Server error occurred');
        } else {
          setError(`Failed to fetch user data: ${err.response?.statusText || 'Unknown error'}`);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchRepositories]);

  // Load user data when component mounts or username changes
  useEffect(() => {
    if (username) {
      console.log("Username from URL params:", username);
      fetchUserData(username);
    } else {
      console.error("No username provided in URL params");
      setError('No username provided');
      setIsLoading(false);
    }
  }, [username, fetchUserData]);

  const handleBack = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const handleRepoClick = useCallback((repo: Repo): void => {
    // Navigate to repository details page
    navigate(`/repo/${user?.login}/repo/${repo.name}`, {
      state: { 
        repoData: repo,
        userName: user?.login 
      }
    });
  }, [navigate, user?.login]);

  const handleFollowersClick = useCallback((): void => {
    if (user) {
      navigate(`/user/${user.login}/followers`);
    }
  }, [navigate, user]);

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
          <span>Loading user data...</span>
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
            Please check if the username exists and try again.
          </p>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="p-4">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          type="button"
        >
          ← Back
        </button>
        <div className="text-center py-8">
          <p className="text-gray-500">No user data available</p>
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

      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          <img
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            className="w-24 h-24 rounded-full border-4 border-gray-100"
            loading="lazy"
            onError={handleImageError}
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name || user.login}
            </h1>
            <p className="text-xl text-gray-600 mb-3">@{user.login}</p>
            
            {user.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
            )}
            
            {user.location && (
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <span>📍</span>
                {user.location}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {user.followers.toLocaleString()}
                </div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {user.following.toLocaleString()}
                </div>
                <div className="text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {user.public_repos.toLocaleString()}
                </div>
                <div className="text-gray-600">Repositories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleFollowersClick}
            disabled={user.followers === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              user.followers === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            type="button"
          >
            View Followers ({user.followers.toLocaleString()})
          </button>
        </div>
      </div>

      {/* Repositories Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Repositories ({repos.length.toLocaleString()})
        </h2>
        
        {repos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No repositories available</p>
            <p className="text-gray-400 text-sm">
              This user either has no public repositories or repository data wasn't fetched.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => handleRepoClick(repo)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
                        {repo.name}
                      </h3>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click for details →
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        ⭐ {repo.stargazers_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        🍴 {repo.forks_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}