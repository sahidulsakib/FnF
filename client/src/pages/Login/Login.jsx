import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import InputField from "../../components/common/InputField";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.login || !formData.password) {
      toast.error("Email/Phone and Password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(formData);

      // Save JWT Token
      localStorage.setItem("token", res.data.token);

      // Load Logged-in User
      await loadUser();

      toast.success("Login Successful 🎉");

      setFormData({
        login: "",
        password: "",
      });

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-2xl">
      <div className="card-body">

        <h2 className="text-3xl font-bold text-center">
          Welcome Back 👋
        </h2>

        <p className="text-center text-sm opacity-70 mb-4">
          Login with Email or Phone
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <InputField
            type="text"
            name="login"
            placeholder="Email or Phone Number"
            value={formData.login}
            onChange={handleChange}
          />

          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-semibold"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;