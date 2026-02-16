const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Only Worker (role_id = 3)
router.post("/profile",
    verifyToken,
    authorizeRoles(3),
    workerController.createProfile
);

router.post("/add-service",
    verifyToken,
    authorizeRoles(3),
    workerController.addServiceToWorker
);

router.get("/my-services",
    verifyToken,
    authorizeRoles(3),
    workerController.getWorkerServices
);

module.exports = router;
