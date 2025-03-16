const express = require('express');
const path = require("path");
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

// ✅ กำหนด Static Path สำหรับให้ Express เสิร์ฟไฟล์ HTML, CSS, JS, และรูปภาพ
app.use(express.static(path.join(__dirname, "../src/view")));
app.use('/style', express.static(path.join(__dirname, "../src/style")));
app.use('/js', express.static(path.join(__dirname, "../src/js")));
app.use('/image', express.static(path.join(__dirname, "../src/image")));

// ✅ Middleware อื่น ๆ
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:8888',
    "https://clinic-project-w900.onrender.com"
  ],
  methods: "GET,POST,PUT,DELETE"
}));

// ✅ Routes API
app.use('/api/students', studentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ✅ Route สำหรับหน้าแรก (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/view/index.html"));
});

// ✅ Route สำหรับ `view` (แก้ปัญหา Cannot GET /view/index.html)
app.get("/view/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, `../src/view/${page}`));
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
