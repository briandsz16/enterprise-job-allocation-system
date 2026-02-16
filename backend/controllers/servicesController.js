const db = require("../config/db");

// Add Service (Admin Only)
exports.addService = (req, res) => {
    const { service_name, description, base_price } = req.body;

    const sql = `
        INSERT INTO services (service_name, description, base_price)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [service_name, description, base_price], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({ message: "Service added successfully" });
    });
};

// Get All Services
exports.getServices = (req, res) => {
    db.query("SELECT * FROM services", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
};
