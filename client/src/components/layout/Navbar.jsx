import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow">
      <div className="navbar-start">
        <Link to="/" className="text-2xl font-bold text-primary">
          FamilyConnect
        </Link>
      </div>

      <div className="navbar-end gap-2">
        <Link to="/login" className="btn btn-ghost">
          Login
        </Link>

        <Link to="/register" className="btn btn-primary">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Navbar;