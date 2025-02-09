const express = require('express');
const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const mangerRoutes = require('./routes/manRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require("./routes/uploadRoutes"); 

const app = express();
const port = 8000;

// Middleware
app.use(express.json());
const uploadDir = path.join(__dirname, "uploads");
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:8888'], //ต้องเปลี่ยนต้อนอัพ server
}));
app.use("/uploads", express.static(uploadDir));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/manager', mangerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
