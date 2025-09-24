import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios, { AxiosError } from "axios";
import type { RootState, AppDispatch } from "../redux/store";
import {
  setUser,
  setRepos,
  setFollowers,
  pushHistory,
} from "../features/githubSlice";
import EditUserModal from "../components/EditUserModal"; 
import type { BackendUser, Follower, GitHubUser, LocationState, MutualFriend, Repo, User } from "../features/user.types";

// Add MutualFriend type


const userCache = new Map<string, { user: User; repos: Repo[]; followers: Follower[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; 
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const GITHUB_API_URL = import.meta.env.VITE_GITHUB_API_URL

export default function UserPage(): React.ReactElement {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: reduxUser, repos: reduxRepos, followers: reduxFollowers } = useSelector((state: RootState) => state.github);
  
  const [user, setLocalUser] = useState<User | null>(null);
  const [repos, setLocalRepos] = useState<Repo[]>([]);
  const [followers, setLocalFollowers] = useState<Follower[]>([]);
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFollowers, setShowFollowers] = useState<boolean>(false);
  const [showMutualFriends, setShowMutualFriends] = useState<boolean>(false);
  const [loadingFollowers, setLoadingFollowers] = useState<boolean>(false);
  const [loadingMutualFriends, setLoadingMutualFriends] = useState<boolean>(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  const shouldAutoLoadFollowers = (location.state as LocationState)?.fromFollowerClick === true;

  const transformUserData = (backendUser: BackendUser): User => ({
    login: backendUser.username,
    avatar_url: backendUser.avatar_url,
    name: backendUser.username,
    location: backendUser.location,
    bio: backendUser.bio,
    followers: backendUser.followers,
    following: backendUser.following,
    public_repos: backendUser.public_repos,
    followers_url: backendUser.followers_url,
    following_url: backendUser.following_url,
    repos_url: backendUser.repos_url || '',
  });

  const handleAxiosError = (err: AxiosError, context: string): string => {
    if (err.response?.status === 404) return `${context} not found`;
    if (err.response?.status === 403) return 'API rate limit exceeded';
    if (err.response?.status === 500) return 'Server error occurred';
    return `${context} error: ${err.response?.statusText || 'Unknown error'}`;
  };

  const isDataFresh = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const getCachedData = (username: string) => {
    const cached = userCache.get(username);
    if (cached && isDataFresh(cached.timestamp)) {
      return cached;
    }
    return null;
  };

  const setCachedData = (username: string, user: User, repos: Repo[], followers: Follower[]) => {
    userCache.set(username, {
      user,
      repos,
      followers,
      timestamp: Date.now()
    });
  };

  const fetchRepositories = useCallback(async (name: string): Promise<Repo[]> => {
    try {
      const response = await axios.get<Repo[]>(`https://api.github.com/users/${name}/repos`);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching repositories:', err);
      return [];
    }
  }, []);

  const fetchMutualFriends = useCallback(async (): Promise<void> => {
    if (!user?.login) return;
    
    try {
      setLoadingMutualFriends(true);
      setError(null);

      console.log('Fetching mutual friends for:', user.login);
      const response = await axios.get(`${BACKEND_URL}/users/mutual-friends/${user.login}`);
      console.log('Raw mutual friends data:', response.data);
      
      const mutualFriendsData = response.data.mutual || [];
      
      setMutualFriends(mutualFriendsData);
      setShowMutualFriends(true);
      
    } catch (err) {
      console.error('Error fetching mutual friends:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = handleAxiosError(err, 'Mutual friends');
        alert(errorMessage);
      } else {
        alert('Failed to fetch mutual friends');
      }
    } finally {
      setLoadingMutualFriends(false);
    }
  }, [user?.login]);

  const fetchUserData = useCallback(async (name: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const cachedData = getCachedData(name);
      if (cachedData) {
        console.log('Using cached data for:', name);
        setLocalUser(cachedData.user);
        setLocalRepos(cachedData.repos);
        setLocalFollowers(cachedData.followers);
        
        dispatch(setUser(cachedData.user));
        dispatch(setRepos(cachedData.repos));
        dispatch(setFollowers(cachedData.followers));
        
        setIsLoading(false);
        return;
      }

      if (reduxUser && reduxUser.login === name) {
        console.log('Using Redux data for:', name);
        setLocalUser(reduxUser as User); 
        setLocalRepos(reduxRepos as Repo[]);
        setLocalFollowers(reduxFollowers);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching fresh data for:', name);
      const userResponse = await axios.get<BackendUser>(`${BACKEND_URL}/users/name/${name}`);
      const transformedUser = transformUserData(userResponse.data);
      
      setLocalUser(transformedUser);
      
      const userRepos = await fetchRepositories(name);
      setLocalRepos(userRepos);
      
      setCachedData(name, transformedUser, userRepos, []);
      
      dispatch(setUser(transformedUser));
      dispatch(setRepos(userRepos));
      dispatch(pushHistory(`/user/${name}`));
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (axios.isAxiosError(err)) {
        setError(handleAxiosError(err, 'User'));
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchRepositories, reduxUser, reduxRepos, reduxFollowers, dispatch]);

  const fetchFollowers = useCallback(async (): Promise<void> => {
    if (!user?.login) return;
    
    try {
      setLoadingFollowers(true);

      const cachedData = getCachedData(user.login);
      if (cachedData && cachedData.followers.length > 0) {
        console.log('Using cached followers for:', user.login);
        setLocalFollowers(cachedData.followers);
        setShowFollowers(true);
        dispatch(setFollowers(cachedData.followers));
        return;
      }

      if (reduxFollowers.length > 0 && reduxUser?.login === user.login) {
        console.log('Using Redux followers for:', user.login);
        setLocalFollowers(reduxFollowers);
        setShowFollowers(true);
        return;
      }

      console.log('Fetching fresh followers for:', user.login);
      const response = await axios.get<Follower[]>(`${GITHUB_API_URL}/users/${user.login}/followers`);
      const followersData = response.data;
      
      setLocalFollowers(followersData);
      setShowFollowers(true);
      
      const currentCache = getCachedData(user.login);
      if (currentCache) {
        setCachedData(user.login, currentCache.user, currentCache.repos, followersData);
      }
      
      dispatch(setFollowers(followersData));
      
    } catch (err) {
      console.error('Error fetching followers:', err);
      if (axios.isAxiosError(err)) {
        alert(handleAxiosError(err, 'Followers'));
      } else {
        alert('Failed to fetch followers');
      }
    } finally {
      setLoadingFollowers(false);
    }
  }, [user?.login, reduxFollowers, reduxUser, dispatch]);

  const saveUserToBackend = async (userData: GitHubUser, reposData: Repo[]): Promise<void> => {
    const userToSave = {
      login: userData.login,
      avatar_url: userData.avatar_url,
      followers_url: userData.followers_url,
      following_url: userData.following_url,
      repos_url: userData.repos_url,
      bio: userData.bio,
      username: userData.login,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      email: userData.email,
      hireable: userData.hireable,
      public_repos: userData.public_repos,
      public_gists: userData.public_gists,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
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

    await axios.post(`${BACKEND_URL}/users`, userToSave);
  };

  const handleUserUpdate = useCallback((updatedUser: User) => {
    setLocalUser(updatedUser);
    dispatch(setUser(updatedUser));
    
    const cachedData = getCachedData(updatedUser.login);
    if (cachedData) {
      setCachedData(updatedUser.login, updatedUser, cachedData.repos, cachedData.followers);
    }
    
    setIsEditModalOpen(false);
  }, [dispatch]);

  const handleBack = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const handleRepoClick = useCallback((repo: Repo): void => {
    navigate(`/repo/${user?.login}/repo/${repo.name}`, {
      state: { 
        repoData: repo,
        userName: user?.login 
      }
    });
  }, [navigate, user?.login]);

  const handleFollowerClick = useCallback(async (followerLogin: string): Promise<void> => {
    if (!followerLogin.trim()) return;

    try {
      setLoadingFollowers(true);

      const cachedData = getCachedData(followerLogin);
      if (cachedData) {
        console.log('Follower data cached, navigating to:', followerLogin);
        navigate(`/user/${followerLogin}`, { state: { fromFollowerClick: true } });
        return;
      }

      try {
        const backendResponse = await axios.get(`${BACKEND_URL}/users/name/${followerLogin}`);
        if (backendResponse.data) {
          navigate(`/user/${followerLogin}`, { state: { fromFollowerClick: true } });
          return;
        }
      } catch (backendError) {
        if (axios.isAxiosError(backendError) && backendError.response?.status !== 404) {
          console.error("Database error:", backendError);
        }
      }

      console.log('Fetching follower from GitHub API:', followerLogin);
      const githubUserResponse = await axios.get<GitHubUser>(`${GITHUB_API_URL}/users/${followerLogin}`);
      const githubUserData = githubUserResponse.data;
      
      let reposData: Repo[] = [];
      try {
        const reposResponse = await axios.get<Repo[]>(githubUserData.repos_url);
        reposData = reposResponse.data || [];
      } catch (reposError) {
        console.warn("Could not fetch repositories:", reposError);
      }

      const transformedFollower: User = {
        login: githubUserData.login,
        avatar_url: githubUserData.avatar_url,
        name: githubUserData.login,
        location: githubUserData.location || undefined,
        bio: githubUserData.bio || undefined,
        followers: githubUserData.followers,
        following: githubUserData.following,
        public_repos: githubUserData.public_repos,
        followers_url: githubUserData.followers_url,
        following_url: githubUserData.following_url,
        repos_url: githubUserData.repos_url,
      };

      setCachedData(followerLogin, transformedFollower, reposData, []);

      try {
        await saveUserToBackend(githubUserData, reposData);
      } catch (saveError) {
        console.error("Error saving follower to database:", saveError);
      }

      navigate(`/user/${followerLogin}`, { state: { fromFollowerClick: true } });

    } catch (error) {
      console.error("Error fetching follower:", error);
      if (axios.isAxiosError(error)) {
        alert(handleAxiosError(error, `GitHub user "${followerLogin}"`));
      } else {
        alert("An error occurred while fetching follower data.");
      }
    } finally {
      setLoadingFollowers(false);
    }
  }, [navigate]);

  const handleMutualFriendClick = useCallback(async (friendLogin: string): Promise<void> => {
    if (!friendLogin.trim()) return;

    try {
      setLoadingMutualFriends(true);

      const cachedData = getCachedData(friendLogin);
      if (cachedData) {
        console.log('Mutual friend data cached, navigating to:', friendLogin);
        navigate(`/user/${friendLogin}`);
        return;
      }

      try {
        const backendResponse = await axios.get(`${BACKEND_URL}/users/name/${friendLogin}`);
        if (backendResponse.data) {
          navigate(`/user/${friendLogin}`);
          return;
        }
      } catch (backendError) {
        if (axios.isAxiosError(backendError) && backendError.response?.status !== 404) {
          console.error("Database error:", backendError);
        }
      }

      console.log('Fetching mutual friend from GitHub API:', friendLogin);
      const githubUserResponse = await axios.get<GitHubUser>(`${GITHUB_API_URL}/users/${friendLogin}`);
      const githubUserData = githubUserResponse.data;
      
      let reposData: Repo[] = [];
      try {
        const reposResponse = await axios.get<Repo[]>(githubUserData.repos_url);
        reposData = reposResponse.data || [];
      } catch (reposError) {
        console.warn("Could not fetch repositories:", reposError);
      }

      const transformedFriend: User = {
        login: githubUserData.login,
        avatar_url: githubUserData.avatar_url,
        name: githubUserData.login,
        location: githubUserData.location || undefined,
        bio: githubUserData.bio || undefined,
        followers: githubUserData.followers,
        following: githubUserData.following,
        public_repos: githubUserData.public_repos,
        followers_url: githubUserData.followers_url,
        following_url: githubUserData.following_url,
        repos_url: githubUserData.repos_url,
      };

      setCachedData(friendLogin, transformedFriend, reposData, []);

      try {
        await saveUserToBackend(githubUserData, reposData);
      } catch (saveError) {
        console.error("Error saving mutual friend to database:", saveError);
      }

      navigate(`/user/${friendLogin}`);

    } catch (error) {
      console.error("Error fetching mutual friend:", error);
      if (axios.isAxiosError(error)) {
        alert(handleAxiosError(error, `GitHub user "${friendLogin}"`));
      } else {
        alert("An error occurred while fetching mutual friend data.");
      }
    } finally {
      setLoadingMutualFriends(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (username) {
      fetchUserData(username);
    } else {
      setError('No username provided');
      setIsLoading(false);
    }
  }, [username, fetchUserData]);

  useEffect(() => {
    if (shouldAutoLoadFollowers && user && !loadingFollowers && !showFollowers) {
      fetchFollowers();
    }
  }, [shouldAutoLoadFollowers, user, loadingFollowers, showFollowers, fetchFollowers]);

  const renderLoadingState = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span>Loading user data...</span>
      </div>
    </div>
  );

  const renderErrorState = () => (
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

  const renderUserProfile = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start gap-6">
        <img
          src={user!.avatar_url}
          alt={`${user!.login} avatar`}
          className="w-24 h-24 rounded-full border-4 border-gray-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${BACKEND_URL}/identicons/default.png`;
          }}
        />
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user!.name || user!.login}
          </h1>
          <p className="text-xl text-gray-600 mb-3">@{user!.login}</p>
          
          {user!.bio && (
            <p className="text-gray-700 mb-4 leading-relaxed">{user!.bio}</p>
          )}
          
          {user!.location && (
            <p className="text-gray-600 mb-4 flex items-center gap-2">
              <span>📍</span>
              {user!.location}
            </p>
          )}

          <div className="flex gap-6 text-sm">
            {['followers', 'following', 'public_repos'].map((stat) => (
              <div key={stat} className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {user![stat as keyof User]?.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  {stat === 'public_repos' ? 'Repositories' : stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          type="button"
        >
          Edit Profile
        </button>
        
        <button
          onClick={() => void fetchFollowers()}
          disabled={loadingFollowers || user!.followers === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            loadingFollowers || user!.followers === 0
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          type="button"
        >
          {loadingFollowers ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            `View Followers (${user!.followers.toLocaleString()})`
          )}
        </button>

        <button
          onClick={() => void fetchMutualFriends()}
          disabled={loadingMutualFriends}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            loadingMutualFriends
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
          type="button"
        >
          {loadingMutualFriends ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            'View Mutual Friends'
          )}
        </button>
      </div>
    </div>
  );

  const renderFollowersSection = () => (
    showFollowers && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Followers ({followers.length.toLocaleString()})
          </h2>
          <button
            onClick={() => setShowFollowers(false)}
            className="text-gray-500 hover:text-gray-700 p-1"
            type="button"
            aria-label="Close followers section"
          >
            ✕
          </button>
        </div>
        
        {followers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No followers found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {followers.map((follower) => (
              <div
                key={follower.login}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleFollowerClick(follower.login)}
              >
                <img
                  src={follower.avatar_url}
                  alt={`${follower.login} avatar`}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `${GITHUB_API_URL}/identicons/default.png`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {follower.login}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  );

  const renderMutualFriendsSection = () => (
    showMutualFriends && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Mutual Friends ({mutualFriends.length.toLocaleString()})
          </h2>
          <button
            onClick={() => setShowMutualFriends(false)}
            className="text-gray-500 hover:text-gray-700 p-1"
            type="button"
            aria-label="Close mutual friends section"
          >
            ✕
          </button>
        </div>
        
        {mutualFriends.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No mutual friends found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mutualFriends.map((friend) => (
              <div
                key={friend.login}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
                onClick={() => handleMutualFriendClick(friend.login)}
              >
                <img
                  src={friend.avatar_url}
                  alt={`${friend.login} avatar`}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://github.com/identicons/default.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {friend.username || friend.login}
                  </p>
                  {friend.username && friend.username !== friend.login && (
                    <p className="text-sm text-gray-500 truncate">
                      @{friend.login}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  );

  const renderRepositoriesSection = () => (
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
  );

  if (isLoading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!user) return (
    <div className="p-4">
      <button onClick={handleBack} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors" type="button">
        ← Back
      </button>
      <div className="text-center py-8">
        <p className="text-gray-500">No user data available</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={handleBack}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        type="button"
      >
        ← Back
      </button>

      {renderUserProfile()}
      {renderFollowersSection()}
      {renderMutualFriendsSection()}
      {renderRepositoriesSection()}
      
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}