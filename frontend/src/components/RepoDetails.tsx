import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { clearRepo } from "../features/githubSlice";

export default function RepoDetails() {
  const repo = useSelector((state: RootState) => state.github.selectedRepo);
  const dispatch = useDispatch();
  if (!repo) return null;

  return (
    <div className="p-4 border">
      <h2 className="text-xl font-bold">{repo.name}</h2>
      <p>{repo.description}</p>
      <p>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</p>
      <button onClick={() => dispatch(clearRepo())} className="mt-2 px-3 py-1 bg-gray-300 rounded">
        Back
      </button>
    </div>
  );
}
