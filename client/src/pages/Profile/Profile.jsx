import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getProfile,
  updateProfile,
} from "../../services/authService";

import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
 const { logout, updateUser } = useAuth();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    profilePic: "",
  });

  // ==========================
  // Fetch Profile
  // ==========================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const res = await getProfile(token);
        const profileUser = res.data.user;

        setEmail(profileUser.email || "");

        setFormData({
          name: profileUser.name || "",
          phone: profileUser.phone || "",
          bio: profileUser.bio || "",
          profilePic: profileUser.profilePic || "",
        });
      } catch (error) {
        console.error(
          "Fetch profile error:",
          error.response?.data || error
        );

        if (error.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate, logout]);

  // ==========================
  // Input Change
  // ==========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (name === "profilePic") {
      setImageError(false);
    }
  };

  // ==========================
  // Update Profile
  // ==========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        name: trimmedName,
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        profilePic: formData.profilePic.trim(),
      };

      const res = await updateProfile(
        updatedData,
        token
      );

      const updatedUser = res.data.user;

      if (updatedUser) {
  updateUser(updatedUser);

  setEmail(updatedUser.email || "");

        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
          bio: updatedUser.bio || "",
          profilePic: updatedUser.profilePic || "",
        });
      }

      toast.success(
        res.data.message ||
          "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // Logout
  // ==========================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const firstLetter =
    formData.name?.charAt(0).toUpperCase() || "U";

  const showProfileImage =
    formData.profilePic.trim() && !imageError;

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Top Navigation */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/")}
          >
            ← Back to Chats
          </button>

          <button
            type="button"
            className="btn btn-error btn-outline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-5 md:p-8">
            <h1 className="text-center text-3xl font-bold">
              My Profile
            </h1>

            {/* Profile Picture Preview */}
            <div className="my-5 flex justify-center">
              <div className="avatar">
                <div className="h-28 w-28 overflow-hidden rounded-full bg-base-300 shadow">
                  {showProfileImage ? (
                    <img
                      src={formData.profilePic}
                      alt={formData.name || "Profile"}
                      className="h-full w-full object-cover"
                      onError={() =>
                        setImageError(true)
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold">
                      {firstLetter}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Profile Picture URL */}
              <div>
                <label
                  htmlFor="profilePic"
                  className="mb-2 block font-medium"
                >
                  Profile Picture URL
                </label>

                <input
                  id="profilePic"
                  type="url"
                  name="profilePic"
                  placeholder="https://example.com/photo.jpg"
                  className="input input-bordered w-full"
                  value={formData.profilePic}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-medium"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  className="input input-bordered w-full opacity-70"
                  value={email}
                  readOnly
                />

                <p className="mt-1 text-sm opacity-60">
                  Email cannot be changed from this page.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block font-medium"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  className="input input-bordered w-full"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block font-medium"
                >
                  Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  className="textarea textarea-bordered min-h-28 w-full"
                  placeholder="Write something about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={saving}
                  maxLength={300}
                />

                <div className="mt-1 text-right text-sm opacity-60">
                  {formData.bio.length}/300
                </div>
              </div>

              {/* Save */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;