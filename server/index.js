const express = require('express');
const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const studentRoutes = require('./routes/studentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const mangerRoutes = require('./routes/manRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require("./routes/uploadRoutes"); 

const app = express();
const port = process.env.PORT || 8000;
console.log("Static Folder Path:", path.join(__dirname, "src", "view"));
console.log("Index File Path:", path.join(__dirname, "src", "view", "index.html"));
const allowedOrigins = [
  "https://clinic-project-w900.onrender.com"  
];
// Middleware
app.use(express.json());
const uploadDir = path.join(__dirname, "uploads");
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE"
}));
app.use(express.static(path.join(__dirname, "src", "view")));

app.use("/uploads", express.static(uploadDir));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/manager', mangerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "view", "index.html"));
});