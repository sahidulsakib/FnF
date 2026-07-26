import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-md px-6">

      {/* Left Space */}
      <div className="flex-1"></div>

      {/* Center Logo */}
      <div className="flex-none">
        <Link
          to={user ? "/" : "/"}
          className="text-2xl font-bold text-primary"
        >
          FamilyConnect
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex justify-end gap-2">

        {!user && (
          <>
            <Link
              to="/login"
              className="btn btn-ghost"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary"
            >
              Register
            </Link>
          </>
        )}

      </div>

    </div>
  );
};

export default Navbar;