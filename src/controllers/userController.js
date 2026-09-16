const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};



const updateMyProfile = async (req, res) => {
    try {
        const { name, phone, address, city } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update only provided fields
        if (name !== undefined) {
            user.name = name;
        }

        if (phone !== undefined) {
            user.profile.phone = phone;
        }

        if (address !== undefined) {
            user.profile.address = address;
        }

        if (city !== undefined) {
            user.profile.city = city;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error("Profile update error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Get user with password
        const user = await User.findById(req.user.userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Password change error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while changing password"
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword
};