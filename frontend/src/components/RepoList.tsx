import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { selectRepo } from "../features/githubSlice";

export default function RepoList() {
  const repos = useSelector((state: RootState) => state.github.repos);
  const dispatch = useDispatch();

  return (
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2">Repositories</h3>
      <ul>
        {repos.map(repo => (
          <li
            key={repo.id}
            className="p-2 border-b cursor-pointer hover:bg-gray-100"
            onClick={() => dispatch(selectRepo(repo))}
          >
            {repo.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
