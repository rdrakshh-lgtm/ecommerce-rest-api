const express = require("express");

const {
    getMyProfile,
    updateMyProfile,
    changePassword
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateMyProfile);

router.put("/change-password", protect, changePassword);
router.get("/admin-test", protect, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin access granted",
        user: req.user
    });
});
module.exports = router;