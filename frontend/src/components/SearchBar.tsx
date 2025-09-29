import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser, setRepos } from "../features/githubSlice";
import type { Repo } from "../features/types";

export default function SearchBar() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchSource, setLastSearchSource] = useState<'database' | 'github' | null>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setLastSearchSource(null); 
  };

  const handleSearch = async () => {
    if (!username.trim()) return;

    try {
      setIsLoading(true);
      
      console.log("Searching for user:", username);

      try {
        const backendResponse = await axios.get(`http://localhost:5000/users/name/${username}`);
        console.log("Backend response:", backendResponse.data);
        
        if (backendResponse.data) {
          console.log("✅ User found in database:", backendResponse.data);
          dispatch(setUser(backendResponse.data));
          dispatch(setRepos(backendResponse.data.repos || []));
          setLastSearchSource('database');
          navigate(`/user/${username}`);
          return;
        }
      } catch (backendError: unknown) {
        if (
          typeof backendError === "object" &&
          backendError !== null &&
          "response" in backendError &&
          typeof (backendError as { response?: { status?: number } }).response === "object" &&
          (backendError as { response?: { status?: number } }).response !== null &&
          "status" in (backendError as { response?: { status?: number } }).response!
        ) {
          if ((backendError as { response: { status: number } }).response.status === 404) {
            console.log("User not found in database, fetching from GitHub API...");
          } else {
            console.error("Database error:", backendError);
          }
        } else {
          console.error("Database error:", backendError);
        }
      }

      console.log("🔍 Fetching user from GitHub API...");
      const githubUserResponse = await axios.get(`https://api.github.com/users/${username}`);
      const githubUserData = githubUserResponse.data;
      
      let reposData = [];
      try {
        const reposResponse = await axios.get(githubUserData.repos_url);
        reposData = reposResponse.data || [];
        console.log(`📦 Found ${reposData.length} repositories`);
      } catch (reposError) {
        console.warn("Could not fetch repositories:", reposError);
      }

      const userToSave = {
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
        repos: reposData.map((repo: Repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          html_url: repo.html_url,
          language: repo.language,
        }))
      };

      try {
        await axios.post('http://localhost:5000/users', userToSave);
        console.log("💾 User saved to database successfully");
        setLastSearchSource('github');
      } catch (saveError) {
        console.error("Error saving user to database:", saveError);
        setLastSearchSource('github');
      }

      dispatch(setUser(userToSave));
      dispatch(setRepos(userToSave.repos));

      navigate(`/user/${username}`);

    } catch (error: unknown) {
      console.error("Error fetching user:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response === "object" &&
        (error as { response?: { status?: number } }).response !== null
      ) {
        const response = (error as { response: { status: number } }).response;
        if (response.status === 404) {
          alert(`GitHub user "${username}" not found. Please check the username and try again.`);
        } else if (response.status === 403) {
          alert("GitHub API rate limit exceeded. Please try again later.");
        } else {
          alert("An error occurred while fetching user data. Please try again.");
        }
      } else {
        alert("An error occurred while fetching user data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 my-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Enter GitHub username"
            className="border px-3 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isLoading || !username.trim()}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isLoading || !username.trim()
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </div>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {lastSearchSource && (
        <div className="text-xs text-gray-500 mb-2">
          {lastSearchSource === 'database' ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Loaded from local database
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Fetched from GitHub and saved locally
            </span>
          )}
        </div>
      )}
    </div>
  );
}