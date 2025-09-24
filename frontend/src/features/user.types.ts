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

export interface User {
  login: string;
  avatar_url: string;
  name?: string;
  location?: string;
  bio?: string;
  followers: number;
  following: number;
  public_repos: number;
  followers_url: string;
  following_url: string;
  repos_url: string;
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
  followers_url: string;
  following_url: string;
  repos_url: string;
  bio?: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
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
  followers_url: string;
  following_url: string;
  repos_url: string;
}

export interface LocationState {
  fromFollowerClick?: boolean;
}
export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export interface FormData {
  name: string;
  bio: string;
  location: string;
}

export interface FormErrors {
  name?: string;
  bio?: string;
  location?: string;
  general?: string;
}

