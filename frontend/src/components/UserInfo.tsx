// import { useSelector, useDispatch } from "react-redux";
// import type { RootState } from "../redux/store";
// import { setFollowers } from "../features/githubSlice";

// export default function UserInfo() {
//   const user = useSelector((state: RootState) => state.github.user);
//   const dispatch = useDispatch();

//   if (!user) return null;

//   const fetchFollowers = async () => {
//     try {
//       const res = await fetch(user.followers_url);
//       const data = await res.json();
//       dispatch(setFollowers(data));
//     } catch (err) {
//       console.error("Failed to fetch followers:", err);
//     }
//   };

//   return (
//     <div className="flex items-center gap-4 my-4">
//       <img
//         src={user.avatar_url}
//         alt="avatar"
//         className="w-16 h-16 rounded-full"
//       />
//       <div>
//         <h2 className="font-bold">{user.login}</h2>
//         <p>{user.bio}</p>
//         <button
//           onClick={fetchFollowers}
//           className="text-blue-500 underline"
//         >
//           View Followers
//         </button>
//       </div>
//     </div>
//   );
// }
