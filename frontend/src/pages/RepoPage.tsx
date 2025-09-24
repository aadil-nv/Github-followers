import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Follower, Repo, User } from "../features/types";
import type { AppDispatch } from "../redux/store";
import { useDispatch } from "react-redux";
import { clearAll } from "../features/githubSlice";

// Repository details interface from GitHub API
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  size: number;
  default_branch: string;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  ssh_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: {
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  archived: boolean;
  disabled: boolean;
  private: boolean;
  fork: boolean;
}

// README content interface
interface ReadmeContent {
  content: string;
  encoding: string;
}
const userCache = new Map<string, { user: User; repos: Repo[]; followers: Follower[]; timestamp: number }>();

export default function ReposPage(): React.ReactElement {
  const { username, reponame } = useParams<{ username: string; reponame: string }>();
  const navigate = useNavigate();
  
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingReadme, setLoadingReadme] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

 

  // Fetch repository details from GitHub API
  const fetchRepoDetails = useCallback(async (username: string, repoName: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching repo details for: ${username}/${repoName}`);
      
      const repoUrl = `https://api.github.com/repos/${username}/${repoName}`;
      const response = await axios.get<GitHubRepo>(repoUrl);
      
      console.log("Repository data:", response.data);
      setRepo(response.data);
      
    } catch (err) {
      console.error('Error fetching repository:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError(`Repository "${username}/${repoName}" not found`);
        } else if (err.response?.status === 403) {
          setError('GitHub API rate limit exceeded or repository is private');
        } else {
          setError(`Failed to fetch repository: ${err.response?.statusText || 'Unknown error'}`);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch README content
  const fetchReadme = useCallback(async (owner: string, repoName: string): Promise<void> => {
    try {
      setLoadingReadme(true);
      
      const readmeUrl = `https://api.github.com/repos/${owner}/${repoName}/readme`;
      const response = await axios.get<ReadmeContent>(readmeUrl);
      
      // Decode base64 content
      const decodedContent = atob(response.data.content);
      setReadme(decodedContent);
      
    } catch (err) {
      console.log('README not found or could not be fetched', err);
      setReadme("");
    } finally {
      setLoadingReadme(false);
    }
  }, []);

  // Load repository data when component mounts
  useEffect(() => {
    if (username && reponame) {
      fetchRepoDetails(username, reponame);
      fetchReadme(username, reponame);
    } else {
      setError('Missing username or repository name');
      setIsLoading(false);
    }
  }, [username, reponame, fetchRepoDetails, fetchReadme]);

  const handleBack = useCallback((): void => {
    if (username) {
      navigate(`/user/${username}`);
    } else {
      navigate(-1);
    }
  }, [navigate, username]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleHome = useCallback((): void => {
      // Clear all Redux data
      dispatch(clearAll());
      // Clear in-memory cache
      userCache.clear();
      // Navigate to home
      navigate('/');
    }, [dispatch, navigate]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>Loading repository details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
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
        </div>
      </div>
    );
  }

  // No repository data
  if (!repo) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          type="button"
        >
          ← Back
        </button>
        <div className="text-center py-8">
          <p className="text-gray-500">No repository data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={handleBack}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        type="button"
      >
        ← Back to {repo.owner.login}
      </button>

      <button
          onClick={handleHome}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          type="button"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Home
        </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src={repo.owner.avatar_url}
              alt={`${repo.owner.login} avatar`}
              className="w-16 h-16 rounded-full border-4 border-gray-100"
              loading="lazy"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">{repo.owner.login}</span>
                <span className="text-gray-400 mx-2">/</span>
                {repo.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {repo.private && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    Private
                  </span>
                )}
                {repo.fork && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Fork
                  </span>
                )}
                {repo.archived && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.open(repo.html_url, '_blank')}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              type="button"
            >
              View on GitHub
            </button>
            <button
              onClick={() => window.open(repo.clone_url, '_blank')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              type="button"
            >
              Clone
            </button>
          </div>
        </div>

        {repo.description && (
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">
            {repo.description}
          </p>
        )}

        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">⭐</div>
            <div className="font-semibold text-lg">{repo.stargazers_count.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">Stars</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">🍴</div>
            <div className="font-semibold text-lg">{repo.forks_count.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">Forks</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">👁</div>
            <div className="font-semibold text-lg">{repo.watchers_count.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">Watchers</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">⚠</div>
            <div className="font-semibold text-lg">{repo.open_issues_count.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">Issues</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">📊</div>
            <div className="font-semibold text-lg">{formatFileSize(repo.size * 1024)}</div>
            <div className="text-gray-600 text-sm">Size</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
l          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Repository Info</h2>
            
            <div className="space-y-3">
              {repo.language && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Language:</span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">{repo.language}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Default Branch:</span>
                <span className="font-medium">{repo.default_branch}</span>
              </div>
              
              {repo.license && (
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium">{repo.license.name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(repo.created_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium">{formatDate(repo.updated_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Last Push:</span>
                <span className="font-medium">{formatDate(repo.pushed_at)}</span>
              </div>
            </div>
          </div>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clone URLs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Clone URLs</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTTPS</label>
                <div className="flex">
                  <input
                    type="text"
                    value={repo.clone_url}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(repo.clone_url)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SSH</label>
                <div className="flex">
                  <input
                    type="text"
                    value={repo.ssh_url}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(repo.ssh_url)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - README */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">README</h2>
            
            {loadingReadme ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span>Loading README...</span>
                </div>
              </div>
            ) : readme ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {readme}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No README found for this repository</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open(`${repo.html_url}/issues`, '_blank')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            type="button"
          >
            View Issues ({repo.open_issues_count})
          </button>
          <button
            onClick={() => window.open(`${repo.html_url}/network/members`, '_blank')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            type="button"
          >
            View Forks ({repo.forks_count})
          </button>
          <button
            onClick={() => window.open(`${repo.html_url}/stargazers`, '_blank')}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            type="button"
          >
            View Stargazers ({repo.stargazers_count})
          </button>
          <button
            onClick={() => window.open(`${repo.html_url}/releases`, '_blank')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            type="button"
          >
            View Releases
          </button>
        </div>
      </div>
    </div>
  );
}