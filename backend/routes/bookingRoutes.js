const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Client creates booking (role_id = 2)
router.post("/create",
    verifyToken,
    authorizeRoles(2),
    bookingController.createBooking
);

// Worker views bookings (role_id = 3)
router.get("/worker-bookings",
    verifyToken,
    authorizeRoles(3),
    bookingController.getWorkerBookings
);

// Worker accepts booking
router.post("/accept",
    verifyToken,
    authorizeRoles(3),
    bookingController.acceptBooking
);

module.exports = router;

router.post("/complete",
    verifyToken,
    authorizeRoles(3),
    bookingController.completeBooking
);

// Admin view all bookings (role_id = 1)
router.get("/all",
    verifyToken,
    authorizeRoles(1),
    bookingController.getAllBookings
);

// Admin dashboard stats
router.get("/dashboard",
    verifyToken,
    authorizeRoles(1),
    bookingController.getDashboardStats
);

