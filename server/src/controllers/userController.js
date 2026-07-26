import User from "../models/User.js";

// ==========================
// Get Logged-in User
// ==========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// Get All Users
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
    })
      .select("name profilePic")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// Update Profile
// ==========================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, profilePic } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();

      if (trimmedPhone && trimmedPhone !== user.phone) {
        const existingPhone = await User.findOne({
          phone: trimmedPhone,
          _id: { $ne: user._id },
        });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists",
          });
        }
      }

      user.phone = trimmedPhone || undefined;
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePic !== undefined) {
      user.profilePic = profilePic.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// Search Users
// ==========================
export const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q?.trim();

    if (!searchQuery) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        // Name: partial match
        {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        // Email: exact match only
        {
          email: searchQuery.toLowerCase(),
        },

        // Phone: exact match only
        {
          phone: searchQuery,
        },
      ],
    })
      .select("name profilePic")
      .limit(20);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};