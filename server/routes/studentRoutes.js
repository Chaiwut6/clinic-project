const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();
const router = express.Router();
const secret = process.env.JWT_SECRET;
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 📌 ตั้งค่า Multer สำหรับอัปโหลดรูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ✅ Route สำหรับอัปโหลดโปรไฟล์
router.post("/upload-profile", upload.single("profileImage"), async (req, res) => {
  let conn;
  try {
    conn = await initMySQL();
    const { stu_id } = req.body;

    if (!stu_id) {
      return res.status(400).json({ success: false, message: "Missing stu_id" });
    }

    // ✅ ค้นหารูปโปรไฟล์ปัจจุบันของ user
    const [existingUser] = await conn.query("SELECT profile_image FROM students WHERE stu_id = ?", [stu_id]);

    let imageUrl = existingUser.length > 0 ? existingUser[0].profile_image : null;

    // ✅ ถ้ามีการอัปโหลดไฟล์ใหม่ ให้อัปเดต
    if (req.file) {
      const newFilePath = `/uploads/profiles/${req.file.filename}`;
      
      // ✅ ลบรูปเก่า ถ้ามี
      if (imageUrl && fs.existsSync(path.join(__dirname, "..", imageUrl))) {
        fs.unlinkSync(path.join(__dirname, "..", imageUrl));
      }

      // ✅ อัปเดตฐานข้อมูลด้วยรูปใหม่
      await conn.query("UPDATE students SET profile_image = ? WHERE stu_id = ?", [newFilePath, stu_id]);
      imageUrl = newFilePath;
    }

    res.json({ success: true, message: "Profile image updated", imageUrl });

  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ success: false, message: "Error updating profile image", error: error.message });
  } finally {
    if (conn) await conn.end();
  }
});

// ✅ ให้ Express เสิร์ฟไฟล์รูปภาพ
router.use("/uploads/profiles", express.static(path.join(__dirname, "../uploads/profiles")));


router.post('/register-user', async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();

    const { title , stu_id, password, stu_fname, stu_lname, nickname, year, phone, faculty , profile_image} = req.body;

    // Validate input fields
    if (!stu_id || !password || !stu_fname || !stu_lname) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Check for duplicate user ID
    const [rows] = await conn.query('SELECT stu_id FROM students WHERE stu_id = ?', [stu_id]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User ID already exists. Please use a different User ID.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user and login data
    const userData = { stu_id, title , stu_fname, stu_lname, nickname, year, phone, faculty, profile_image:profile_image || "" };
    
    const loginData = { login_id: stu_id, password: passwordHash, roles: 'student' };

    await conn.query('INSERT INTO students SET ?', userData);
    await conn.query('INSERT INTO login SET ?', loginData);

    // Create JWT token
    const token = jwt.sign({ login_id: stu_id }, secret, { expiresIn: '1h' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'Strict',
    });

    // Response
    res.status(201).json({
      message: 'User registered successfully',
      stu_id,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.end();
    }
  }
});

router.post("/login", async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();
    const { login_id, password } = req.body;

    // ดึงข้อมูลจากตาราง login
    const [loginResults] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    const userData = loginResults[0];

    if (!userData) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ตรวจสอบรหัสผ่าน
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ดึงข้อมูลเพิ่มเติมตามบทบาทผู้ใช้
    let userInfo = null;
    let userAssess = null;

    if (userData.roles === 'student') {
      const [userResults] = await conn.query("SELECT * FROM students WHERE stu_id = ?", [login_id]);
      const [userAssessResults] = await conn.query("SELECT * FROM risk_results WHERE stu_id = ?", [login_id]);
      userInfo = userResults[0];
      userAssess = userAssessResults;
    } else if (userData.roles === 'employee') {
      const [employeeResults] = await conn.query("SELECT * FROM employee WHERE employee_id = ?", [login_id]);
      userInfo = employeeResults[0]; 
    }

    // สร้าง token
    const token = jwt.sign({ login_id, roles: userData.roles }, secret, { expiresIn: '1h' });

    // ตั้งค่า cookie
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 3600000, 
      sameSite: 'Strict' 
  });
    // ตอบกลับข้อมูลการเข้าสู่ระบบ
    res.json({
      roles: userData.roles,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userData,
      userInfo,
      Assess: userAssess,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'ไม่สามารถเข้าสู่ระบบได้', error: error.message });
  }finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/students', async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();
    const authHeader = req.headers['authorization'];
    let authToken = '';

    if (authHeader) {
      authToken = authHeader.split(' ')[1];
    }
    
    if (!authToken) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    const user = jwt.verify(authToken, process.env.JWT_SECRET);

    const [checkResults] = await conn.query('SELECT * FROM students WHERE stu_id = ?', [user.stu_id]);
    if (!checkResults[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [results] = await conn.query('SELECT * FROM students');
    res.json({
      students: results,
    });
  } catch (error) {
    console.log('error', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});


router.post('/getAllstudents', async (req, res) => {
  let conn;
  try {
      conn = await initMySQL();
      const [students] = await conn.query("SELECT stu_id, year FROM students");

      if (!Array.isArray(students)) {
          return res.status(500).json({ message: "เกิดข้อผิดพลาด: students ไม่ใช่ array" });
      }

      res.json({ success: true, students }); // ✅ ส่งเป็น JSON รูปแบบที่ถูกต้อง
  } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้", error: error.message });
  } finally {
      if (conn) await conn.end();
  }
});

router.post("/updateStudyYear", async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();
    const studentsToUpdate = req.body.students;

    if (!studentsToUpdate || studentsToUpdate.length === 0) {
      return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องอัปเดต" });
    }

    await conn.beginTransaction();

    for (const user of studentsToUpdate) {
      await conn.query("UPDATE students SET year = ? WHERE stu_id = ?", [user.year, user.stu_id]);
    }

    await conn.commit();
    res.json({ success: true, message: "✅ อัปเดตชั้นปีอัตโนมัติสำเร็จ" });

  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error updating study year:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตชั้นปี", error: error.message });
  } finally {
    if (conn) await conn.end();
  }
});



router.post('/userCount', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();
    const [result] = await conn.query("SELECT COUNT(*) AS count FROM students");

    res.json({
      success: true,
      userCount: result[0]?.count || 0, // ดึงค่าจากฐานข้อมูล
    });

  } catch (error) {
    console.error('Error retrieving user count:', error);
    res.status(500).json({ success: false, message: 'Error retrieving user count', error: error.message });

  } finally {
    if (conn) {
      await conn.end();
    }
  }
});


// เพิ่มสำหรับบันทึกผลลัพธ์
router.post('/save-result', async (req, res) => {
  let conn = null;
  try {
      conn = await initMySQL();
      const { result_id, stu_id, totalScore, result, stu_fname, stu_lname } = req.body;

      // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!result_id || !stu_id || totalScore === undefined || result === undefined) {
          return res.status(400).json({ 
              message: 'Result ID, User ID, totalScore, and result are required' 
          });
      }

      // สร้างข้อมูลใหม่สำหรับผลลัพธ์การประเมิน
      const userData = {
          result_id: result_id,
          stu_id: stu_id,
          total_score: totalScore,
          result: result,
          stu_fname: stu_fname,
          stu_lname: stu_lname,
      };

      // แทรกข้อมูลใหม่เข้าไปในฐานข้อมูล
      const [results] = await conn.query('INSERT INTO risk_results SET ?', userData);

      // ตรวจสอบผลการแทรกข้อมูล
      if (results.affectedRows > 0) {
          res.json({
              message: 'Result saved successfully',
              result_id: result_id, // ส่ง result_id กลับไป
          });
      } else {
          res.status(500).json({
              message: 'Failed to save result'
          });
      }
  } catch (error) {
      console.log('Error:', error);
      res.status(500).json({
          message: 'Error saving result',
          error: error.message
      });
  } finally {
      // Ensure the connection is closed
      if (conn) {
          await conn.end();
      }
  }
});


router.post('/userinfo', verifyToken, async (req, res) => {
  const login_id = req.user.login_id;
  let conn = null;

  try {
    conn = await initMySQL();

    // Query user information
    const [userResults] = await conn.query("SELECT * FROM students WHERE stu_id = ?", [login_id]);
    const [userAssess] = await conn.query("SELECT * FROM risk_results WHERE stu_id = ?", [login_id]);
    
    const userInfo = userResults[0];
    const userAssessInfo = userAssess;

    if (!userInfo) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: userInfo,
      Assess: userAssessInfo,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  } finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
});

router.post('/change-password', verifyToken, async (req, res) => {
  let conn = null;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const login_id = req.user.login_id;  // ใช้ login_id จากข้อมูลใน token
  
  try {
    conn = await initMySQL();

    // ตรวจสอบว่า newPassword และ confirmPassword ตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
    }

    // ค้นหาผู้ใช้จาก login_id ในฐานข้อมูล
    const [userLogin] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    
    // หากไม่พบผู้ใช้
    if (!userLogin || userLogin.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const userInfo = userLogin[0];

    // ตรวจสอบรหัสผ่านเก่า
    const isMatch = await bcrypt.compare(oldPassword, userInfo.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    // ตรวจสอบว่า newPassword ไม่เหมือนกับรหัสเดิม
    const isSamePassword = await bcrypt.compare(newPassword, userInfo.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเก่า' });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    const [result] = await conn.query("UPDATE login SET password = ? WHERE login_id = ?", [hashedPassword, login_id]);
    // console.log("Update result:", result);

    // ส่งคำตอบสำเร็จ
    res.status(200).json({ message: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดระหว่างการอัพเดตรหัสผ่าน:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.end();
    }
  }
});


router.post('/updateuser', verifyToken, async (req, res) => {
  const login_id = req.user.login_id; // ได้มาจาก verifyToken
  let conn = null;
  const {
    stu_fname, stu_lname, nickname, faculty, phone
  } = req.body;

  try {
    conn = await initMySQL();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!stu_fname || !stu_lname || !faculty  || !nickname || !phone) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // เริ่มต้นธุรกรรม
    await conn.beginTransaction();

    // อัปเดตในตาราง students
    const [result1] = await conn.query(
      "UPDATE students SET stu_fname = ?, stu_lname = ?, nickname = ?, faculty = ?, phone = ? WHERE stu_id = ?",
      [stu_fname, stu_lname, nickname, faculty,phone, login_id]
    );

    // อัปเดตในตาราง results
    const [result2] = await conn.query(
      "UPDATE risk_results SET stu_fname = ?, stu_lname = ? WHERE stu_id = ?",
      [stu_fname, stu_lname, login_id]
    );

    const [result3] = await conn.query(
      "UPDATE appointments SET stu_fname = ?, stu_lname = ? WHERE stu_id = ?",
      [stu_fname, stu_lname, login_id]
    );

    if (result1.affectedRows > 0 || result2.affectedRows > 0) {
      await conn.commit();
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      // ยกเลิกการเปลี่ยนแปลงหากไม่มีการอัปเดต
      await conn.rollback();
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }
  } catch (error) {
    // ยกเลิกการเปลี่ยนแปลงหากเกิดข้อผิดพลาด
    if (conn) await conn.rollback();

    console.error('Error during user update:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    // ตรวจสอบให้แน่ใจว่าการเชื่อมต่อถูกปิด
    if (conn) {
      await conn.end();
    }
  }
});


router.post('/checkuser', async (req, res) => {
  const { stu_id } = req.body;
  let conn = null;
  
  try {
    // เริ่มการเชื่อมต่อกับ MySQL
    conn = await initMySQL();

    // ตรวจสอบว่า stu_id มีอยู่ในฐานข้อมูลหรือไม่
    const [checuser] = await conn.query("SELECT * FROM students WHERE stu_id = ?", [stu_id]);
    
    if (checuser.length > 0) {
      // ถ้ามี stu_id ซ้ำในฐานข้อมูล
      return res.status(200).json({ success: false, message: 'User ID already exists' });
    } else {
      // ถ้าไม่มี stu_id ในฐานข้อมูล
      return res.status(200).json({ success: true, message: 'User ID is available' });
    }
  } catch (error) {
    // แสดงข้อผิดพลาดในระบบ
    console.error('Error during user check:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    // ตรวจสอบให้แน่ใจว่าการเชื่อมต่อถูกปิด
    if (conn) {
      await conn.end();
    }
  }
});


router.post('/appointment', verifyToken, async (req, res) => {
  const stu_id = req.user.login_id;
  let conn = null;

  try {
    conn = await initMySQL();

    // ดึงการนัดที่รอการยืนยัน (ถ้ามี)
    const [pendingAppointment] = await conn.query(
      `
      SELECT * 
      FROM appointments 
      WHERE stu_id = ? AND status = 'รอการยืนยัน'
      ORDER BY date ASC, time_start ASC
      LIMIT 1
      `,
      [stu_id]
    );

    // ถ้าไม่มีการนัดรอการยืนยัน ดึงการนัดที่ยืนยันล่าสุด
    let confirmedAppointment = [];
    if (pendingAppointment.length === 0) {
      [confirmedAppointment] = await conn.query(
        `
        SELECT * 
        FROM appointments 
        WHERE stu_id = ? AND status = 'ยืนยัน'
        ORDER BY date DESC, time_start DESC
        LIMIT 1
        `,
        [stu_id]
      );
    }

    return res.status(200).json({
      success: true,
      pendingAppointment: pendingAppointment[0] || null,
      confirmedAppointment: confirmedAppointment[0] || null,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error.message);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});




router.post('/update-appointment', async (req, res) => {
  const { Appointment_id, status } = req.body;
  let conn = null;

  try {
    // เชื่อมต่อกับฐานข้อมูล
    conn = await initMySQL();

    // อัปเดตสถานะของการนัดหมาย
    const [result] = await conn.query(
      "UPDATE appointments SET status = ? WHERE Appointment_id = ?",
      [status, Appointment_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบการนัดหมายที่ต้องการอัปเดต' });
    }

    res.status(200).json({ success: true, message: `สถานะการนัดหมายถูกอัปเดตเป็น ${status}` });
  } catch (error) {
    console.error('Error updating status:', error.message);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

module.exports = router;
