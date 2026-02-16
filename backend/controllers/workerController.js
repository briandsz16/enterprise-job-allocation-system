const db = require("../config/db");

// Create Worker Profile
exports.createProfile = (req, res) => {
    const worker_id = req.user.user_id; // from JWT
    const { bio, experience_years } = req.body;

    const sql = `
        INSERT INTO worker_profiles (worker_id, bio, experience_years)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [worker_id, bio, experience_years], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Worker profile created successfully" });
    });
};

// Add Service to Worker
exports.addServiceToWorker = (req, res) => {
    const worker_id = req.user.user_id;
    const { service_id, custom_price } = req.body;

    const sql = `
        INSERT INTO worker_services (worker_id, service_id, custom_price)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [worker_id, service_id, custom_price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Service added to worker" });
    });
};

// View Worker Services
exports.getWorkerServices = (req, res) => {
    const worker_id = req.user.user_id;

    const sql = `
        SELECT s.service_name, ws.custom_price
        FROM worker_services ws
        JOIN services s ON ws.service_id = s.service_id
        WHERE ws.worker_id = ?
    `;

    db.query(sql, [worker_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
};
