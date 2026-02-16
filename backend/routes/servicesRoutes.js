const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Admin Only
router.post("/add",
    verifyToken,
    authorizeRoles(1),
    servicesController.addService
);

// Public
router.get("/all", servicesController.getServices);

module.exports = router;