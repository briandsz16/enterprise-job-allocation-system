const bookingRoutes = require("./routes/bookingRoutes");
const workerRoutes = require("./routes/workerRoutes");
const servicesRoutes = require("./routes/servicesRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/bookings", bookingRoutes);



app.get("/", (req, res) => {
    res.send("Enterprise Job Allocation System API Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
