import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../../components/common/InputField";
const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
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
                    Welcome Back 👋
                </h2>

                <p className="text-center text-sm opacity-70 mb-4">
                    Login to continue
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <button className="btn btn-primary w-full">
                        Login
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