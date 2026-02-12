const mysql = require("mysql2");

// Create connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "enterprise_job_system"
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

module.exports = db;
