import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Chats from "../pages/Chats/Chats";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;