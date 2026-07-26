import { useEffect, useState } from "react";
import { searchUsers } from "../../services/userService";

const SearchUser = ({ token, handleSelectUser }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await searchUsers(trimmedQuery, token);
        setUsers(res.data.users || []);
      } catch (error) {
        console.error("User search failed:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, token]);

  const handleUserClick = (user) => {
    handleSelectUser(user);
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="space-y-4">
      <input
        type="search"
        name="userSearch"
        className="input input-bordered w-full"
        placeholder="Search by name, full email or full phone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {loading && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => handleUserClick(user)}
              className="card w-full bg-base-100 text-left shadow transition hover:bg-base-200"
            >
              <div className="card-body flex-row items-center gap-4 py-4">
                <div className="avatar">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-base-300">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="flex-1 text-lg font-bold">
                  {user.name}
                </h2>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && query.trim() && users.length === 0 && (
        <div className="py-4 text-center opacity-60">
          No users found
        </div>
      )}
    </div>
  );
};

export default SearchUser;