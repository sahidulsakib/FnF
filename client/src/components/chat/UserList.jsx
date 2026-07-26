const UserList = ({
  users,
  usersLoading,
  selectedUser,
  handleSelectUser,
}) => {
  if (usersLoading) {
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="alert">
        <span>No users found.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => handleSelectUser(u)}
          className={`card shadow-md cursor-pointer transition hover:bg-base-200 ${
            selectedUser?._id === u._id
              ? "bg-primary text-primary-content"
              : "bg-base-100"
          }`}
        >
          <div className="card-body">
            <h3 className="font-bold text-lg">{u.name}</h3>

            <p>{u.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;