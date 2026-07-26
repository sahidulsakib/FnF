import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await getAllUsers(token);
        setUsers(res.data.users);
      } catch (error) {
        logout();
        navigate("/login");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, logout]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome {user?.name} 👋
          </h1>

          <p className="opacity-70">
            {user?.email}
          </p>
        </div>

        <button
          className="btn btn-error"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        All Users
      </h2>

      {usersLoading ? (
        <div className="flex justify-center mt-10">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : users.length === 0 ? (
        <div className="alert">
          <span>No users found.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="card bg-base-100 shadow-md"
            >
              <div className="card-body">
                <h3 className="font-bold text-lg">
                  {u.name}
                </h3>

                <p className="opacity-70">
                  {u.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;