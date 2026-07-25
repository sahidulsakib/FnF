import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../../components/common/InputField";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-2xl">
      <div className="card-body">

        <h2 className="text-3xl font-bold text-center">
          Create Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <InputField
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button className="btn btn-primary w-full">
            Create Account
          </button>

        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;