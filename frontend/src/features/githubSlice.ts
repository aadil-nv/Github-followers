import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User { /* minimal type */ login: string; avatar_url: string; followers_url: string; following_url: string; repos_url: string; bio?: string; }
interface Repo { id: number; name: string; description: string; stargazers_count: number; forks_count: number; }

interface GithubState {
  user: User | null;
  repos: Repo[];
  selectedRepo: Repo | null;
  followers: User[];
  following: User[];
  historyStack: string[]; // track pages for back button
}

const initialState: GithubState = {
  user: null,
  repos: [],
  selectedRepo: null,
  followers: [],
  following: [],
  historyStack: [],
};

const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setRepos(state, action: PayloadAction<Repo[]>) {
      state.repos = action.payload;
    },
    selectRepo(state, action: PayloadAction<Repo>) {
      state.selectedRepo = action.payload;
    },
    clearRepo(state) {
      state.selectedRepo = null;
    },
    setFollowers(state, action: PayloadAction<User[]>) {
      state.followers = action.payload;
    },
    setFollowing(state, action: PayloadAction<User[]>) {
      state.following = action.payload;
    },
    pushHistory(state, action: PayloadAction<string>) {
      state.historyStack.push(action.payload);
    },
    popHistory(state) {
      state.historyStack.pop();
    },
  },
});

export const {
  setUser,
  setRepos,
  selectRepo,
  clearRepo,
  setFollowers,
  setFollowing,
  pushHistory,
  popHistory,
} = githubSlice.actions;

export default githubSlice.reducer;
