import axios from "axios";
import type { Repo } from "../features/types";
import type {  User } from "../features/user.types";

const BACKEND_URL = "http://localhost:5000";
const GITHUB_API_URL = "https://api.github.com";

export async function fetchUserFromDB(username: string) {
  return axios.get(`${BACKEND_URL}/users/name/${username}`);
}

export async function saveUserToDB(userData: User) {
  return axios.post(`${BACKEND_URL}/users`, userData);
}

export async function fetchUserFromGitHub(username: string) {
  const userResponse = await axios.get(`${GITHUB_API_URL}/users/${username}`);
  const userData = userResponse.data;

  let reposData: Repo[] = [];
  try {
    const reposResponse = await axios.get(userData.repos_url);
    reposData = reposResponse.data || [];
  } catch (err) {
    console.warn("Could not fetch repositories:", err);
  }

  return {
    ...userData,
    repos: reposData.map((repo: Repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      html_url: repo.html_url,
      language: repo.language,
    })),
  };
}

