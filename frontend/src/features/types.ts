export interface User {
  login: string;
  avatar_url: string;
  name?: string;
  location?: string;
  bio?: string;
  followers: number;
  following: number;
  public_repos: number;
}

export interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string;
}

export interface Follower {
  login: string;
  avatar_url: string;
}


// Shared type definitions for the application

// Backend API Response interface (what you actually get from your API)
export interface BackendUser {
  id: string;
  username: string;
  location?: string;
  blog?: string;
  bio?: string;
  avatar_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Frontend User interface (what your component uses)
export interface User {
  login: string;
  avatar_url: string;
  name?: string;
  location?: string;
  bio?: string;
  followers: number;
  following: number;
  public_repos: number;
}

// Repository interface
export interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string;
}

// Follower interface
export interface Follower {
  login: string;
  avatar_url: string;
}

// GitHub API User Response interface
export interface GitHubUser {
  login: string;
  avatar_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
  hireable: boolean | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// Repository interface for GitHub API
export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string | null;
}

// User to save interface for backend
export interface UserToSave {
  login: string;
  avatar_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  bio: string | null;
  username: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
  hireable: boolean | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  repos: Array<{
    id: number;
    name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    language: string | null;
  }>;
}

// API Error response interface
export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

// Route state interfaces
export interface LocationState {
  fromFollowerClick?: boolean;
  repoData?: Repo;
  userName?: string;
}