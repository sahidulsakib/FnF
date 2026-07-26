import { useMemo, useState } from "react";

const UserList = ({
  users,
  usersLoading,
  selectedUser,
  handleSelectUser,
  onlineUsers,
}) => {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const keyword = search.toLowerCase();

    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(keyword) ||
        u.email?.toLowerCase().includes(keyword) ||
        u.phone?.includes(keyword)
      );
    });
  }, [search, users]);

  if (usersLoading) {
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search by name, email or phone..."
        className="input input-bordered w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Empty */}
      {filteredUsers.length === 0 ? (
        <div className="alert">
          <span>No users found.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isOnline = onlineUsers.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`card shadow-md cursor-pointer transition hover:bg-base-200 ${
                  selectedUser?._id === u._id
                    ? "bg-primary text-primary-content"
                    : "bg-base-100"
                }`}
              >
                <div className="card-body py-4">

                  <div className="flex items-center gap-4">

                    {/* Profile Picture */}
                    <div className="avatar">
                      <div className="w-14 rounded-full bg-neutral text-neutral-content">
                        {u.profilePic ? (
                          <img
                            src={u.profilePic}
                            alt={u.name}
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {u.name}
                      </h3>
                    </div>

                    {/* Online */}
                    {isOnline && (
                      <div
                        className="w-3 h-3 rounded-full bg-green-500"
                        title="Online"
                      />
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserList;