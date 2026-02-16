const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/dashboard",
    verifyToken,
    authorizeRoles(1), // Only Admin (role_id = 1)
    (req, res) => {
        res.json({ message: "Welcome Admin Dashboard" });
    }
);

module.exports = router;
