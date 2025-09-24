import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser, setRepos } from "../features/githubSlice";
import { fetchUserFromDB, saveUserToDB, fetchUserFromGitHub } from "../api/userApi";




export default function SearchBar() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchSource, setLastSearchSource] = useState<'database' | 'github' | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!username.trim()) return;

    try {
      setIsLoading(true);

      // Try DB first
      try {
        const backendResponse = await fetchUserFromDB(username);
        if (backendResponse.data) {
          dispatch(setUser(backendResponse.data));
          dispatch(setRepos(backendResponse.data.repos || []));
          setLastSearchSource("database");
          navigate(`/user/${username}`);
          return;
        }
      } catch (err: unknown) {
        interface ErrorWithResponse {
          response?: {
            status?: number;
          };
        }
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          (err as ErrorWithResponse).response?.status === 404
        ) {
          console.log("Not in DB → fetching from GitHub");
        } else {
          console.error("Database error:", err);
        }
      }

      // GitHub fetch
      const githubUserData = await fetchUserFromGitHub(username);
      await saveUserToDB(githubUserData).catch((err: unknown) =>
        console.error("Error saving user to DB:", err)
      );

      dispatch(setUser(githubUserData));
      dispatch(setRepos(githubUserData.repos));
      setLastSearchSource("github");
      navigate(`/user/${username}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Search error:", err.message);
      } else {
        console.error("Search error:", err);
      }
      alert("An error occurred while fetching user data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 my-4">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="border px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !username.trim()}
          className={`px-6 py-2 rounded-lg text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {lastSearchSource && (
        <div className="text-xs text-gray-500">
          {lastSearchSource === "database" ? "✅ Loaded from DB" : "🌐 Fetched from GitHub"}
        </div>
      )}
    </div>
  );
}
