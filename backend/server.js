const db = require("./config/db");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Enterprise Job Allocation System API Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
