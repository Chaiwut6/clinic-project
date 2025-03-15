const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const studentRoutes = require('./routes/studentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/manRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require("./routes/uploadRoutes"); 

const app = express();
const port = process.env.PORT || 8000;


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ["https://clinic-project-w900.onrender.com"]
}));

// กำหนด Route สำหรับ API
app.use('/api/students', studentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// สร้าง route เพื่อให้สามารถเข้าถึงหน้า index.html ได้
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/view/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
