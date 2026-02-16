const db = require("../config/db");

// Smart Auto Booking - Least Busy + Availability Check
exports.createBooking = (req, res) => {
    const client_id = req.user.user_id;
    const { service_id, event_date, total_amount } = req.body;

    const findWorkerSQL = `
        SELECT ws.worker_id,
               COUNT(b.booking_id) AS active_bookings
        FROM worker_services ws
        LEFT JOIN bookings b 
            ON ws.worker_id = b.worker_id 
            AND b.status IN ('pending', 'accepted')
        WHERE ws.service_id = ?
        GROUP BY ws.worker_id
        ORDER BY active_bookings ASC
    `;

    db.query(findWorkerSQL, [service_id], (err, workers) => {
        if (err) return res.status(500).json({ error: err.message });

        if (workers.length === 0) {
            return res.status(404).json({ message: "No worker available for this service" });
        }

        // Check availability one by one
        const checkAvailability = (index) => {
            if (index >= workers.length) {
                return res.status(404).json({ message: "No available worker on selected date" });
            }

            const worker_id = workers[index].worker_id;

            const availabilitySQL = `
                SELECT * FROM bookings
                WHERE worker_id = ?
                AND event_date = ?
                AND status IN ('pending','accepted')
            `;

            db.query(availabilitySQL, [worker_id, event_date], (err, bookings) => {
                if (err) return res.status(500).json({ error: err.message });

                if (bookings.length === 0) {
                    // Worker is available → assign
                    const insertBookingSQL = `
                        INSERT INTO bookings (client_id, worker_id, service_id, event_date, total_amount)
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(insertBookingSQL,
                        [client_id, worker_id, service_id, event_date, total_amount],
                        (err, result) => {
                            if (err) return res.status(500).json({ error: err.message });

                            res.status(201).json({
                                message: "Booking created with availability check",
                                worker_id: worker_id
                            });
                        });
                } else {
                    // Worker busy on that date → check next
                    checkAvailability(index + 1);
                }
            });
        };

        checkAvailability(0);
    });
};



// Worker views assigned bookings
exports.getWorkerBookings = (req, res) => {
    const worker_id = req.user.user_id;

    const sql = `
        SELECT b.*, s.service_name
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        WHERE b.worker_id = ?
    `;

    db.query(sql, [worker_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
};

// Worker accepts booking
exports.acceptBooking = (req, res) => {
    const worker_id = req.user.user_id;
    const { booking_id } = req.body;

    const sql = `
        UPDATE bookings
        SET status = 'accepted'
        WHERE booking_id = ? AND worker_id = ?
    `;

    db.query(sql, [booking_id, worker_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Booking accepted" });
    });
};

// Worker completes booking
exports.completeBooking = (req, res) => {
    const worker_id = req.user.user_id;
    const { booking_id } = req.body;

    const sql = `
        UPDATE bookings
        SET status = 'completed'
        WHERE booking_id = ? AND worker_id = ?
    `;

    db.query(sql, [booking_id, worker_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Booking completed successfully" });
    });
};

// Admin view all bookings
exports.getAllBookings = (req, res) => {
    const sql = `
        SELECT b.*, 
               u1.full_name AS client_name,
               u2.full_name AS worker_name,
               s.service_name
        FROM bookings b
        JOIN users u1 ON b.client_id = u1.user_id
        JOIN users u2 ON b.worker_id = u2.user_id
        JOIN services s ON b.service_id = s.service_id
        ORDER BY b.booking_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
};

// Admin Dashboard Analytics
exports.getDashboardStats = (req, res) => {

    const stats = {};

    const totalUsersSQL = `SELECT COUNT(*) AS total_users FROM users`;
    const totalWorkersSQL = `SELECT COUNT(*) AS total_workers FROM users WHERE role_id = 3`;
    const totalClientsSQL = `SELECT COUNT(*) AS total_clients FROM users WHERE role_id = 2`;
    const totalBookingsSQL = `SELECT COUNT(*) AS total_bookings FROM bookings`;
    const activeBookingsSQL = `
        SELECT COUNT(*) AS active_bookings 
        FROM bookings 
        WHERE status IN ('pending','accepted')
    `;
    const completedBookingsSQL = `
        SELECT COUNT(*) AS completed_bookings 
        FROM bookings 
        WHERE status = 'completed'
    `;
    const revenueSQL = `
        SELECT IFNULL(SUM(total_amount),0) AS total_revenue 
        FROM bookings 
        WHERE status = 'completed'
    `;
    const monthlyBookingsSQL = `
        SELECT DATE_FORMAT(booking_date, '%Y-%m') AS month,
               COUNT(*) AS total
        FROM bookings
        GROUP BY month
        ORDER BY month DESC
    `;

    db.query(totalUsersSQL, (err, result1) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total_users = result1[0].total_users;

        db.query(totalWorkersSQL, (err, result2) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.total_workers = result2[0].total_workers;

            db.query(totalClientsSQL, (err, result3) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.total_clients = result3[0].total_clients;

                db.query(totalBookingsSQL, (err, result4) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.total_bookings = result4[0].total_bookings;

                    db.query(activeBookingsSQL, (err, result5) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.active_bookings = result5[0].active_bookings;

                        db.query(completedBookingsSQL, (err, result6) => {
                            if (err) return res.status(500).json({ error: err.message });
                            stats.completed_bookings = result6[0].completed_bookings;

                            db.query(revenueSQL, (err, result7) => {
                                if (err) return res.status(500).json({ error: err.message });
                                stats.total_revenue = result7[0].total_revenue;

                                db.query(monthlyBookingsSQL, (err, result8) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    stats.monthly_bookings = result8;

                                    res.json(stats);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

