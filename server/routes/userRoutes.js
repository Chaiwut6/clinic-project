const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
const secret = 'mysecret';

// Route: Register user
router.post('/register-user', async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();

    const { user_id, password, user_fname, user_lname, nickname, year, phone, faculty } = req.body;

    // Validate input fields
    if (!user_id || !password || !user_fname || !user_lname) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Check for duplicate user ID
    const [rows] = await conn.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User ID already exists. Please use a different User ID.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user and login data
    const userData = { user_id, user_fname, user_lname, nickname, year, phone, faculty };
    const loginData = { login_id: user_id, password: passwordHash, roles: 'user' };

    await conn.query('INSERT INTO users SET ?', userData);
    await conn.query('INSERT INTO login SET ?', loginData);

    // Create JWT token
    const token = jwt.sign({ login_id: user_id }, secret, { expiresIn: '1h' });

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
      user_id,
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

    if (userData.roles === 'user') {
      const [userResults] = await conn.query("SELECT * FROM users WHERE user_id = ?", [login_id]);
      const [userAssessResults] = await conn.query("SELECT * FROM results WHERE user_id = ?", [login_id]);
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
      sameSite: 'Strict',
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

router.post('/users', async (req, res) => {
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

    const [checkResults] = await conn.query('SELECT * FROM users WHERE user_id = ?', [user.user_id]);
    if (!checkResults[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [results] = await conn.query('SELECT * FROM users');
    res.json({
      users: results,
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


// เพิ่มสำหรับบันทึกผลลัพธ์
router.post('/save-result', async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();
    const { user_id, totalScore, result, user_fname, user_lname } = req.body;

    // ตรวจสอบว่า user_id ถูกส่งมาหรือไม่
    if (!user_id || totalScore === undefined || result === undefined) {
      return res.status(400).json({ message: 'User ID, totalScore, and result are required' });
    }

    // สร้างข้อมูลใหม่สำหรับผลลัพธ์การประเมิน
    const userData = {
      user_id: user_id,
      total_score: totalScore,
      result: result,
      user_fname: user_fname,
      user_lname: user_lname,
    };

    // แทรกข้อมูลใหม่เข้าไปในฐานข้อมูล
    const [results] = await conn.query('INSERT INTO results SET ?', userData);

    // ตรวจสอบผลการแทรกข้อมูล
    if (results.affectedRows > 0) {
      res.json({
        message: 'Result saved successfully',
        result_id: results.insertId,  // คืนค่า ID ที่ถูกแทรกเข้าไปในฐานข้อมูล
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
    const [userResults] = await conn.query("SELECT * FROM users WHERE user_id = ?", [login_id]);
    const [userAssess] = await conn.query("SELECT * FROM results WHERE user_id = ?", [login_id]);
    
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
    console.log("Update result:", result);

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
  const login_id = req.user.login_id;
  let conn = null;
  const {
    user_id, user_fname, user_lname, nickname, faculty, year, phone
  } = req.body;

  try {
    conn = await initMySQL();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!user_id || !user_fname || !user_lname || !faculty || !year || !nickname || !phone) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // รันคำสั่ง SQL อัปเดตข้อมูล
    const [result] = await conn.query(
      "UPDATE users SET user_id = ?, user_fname = ?, user_lname = ?, nickname = ?, faculty = ?, year = ?, phone = ? WHERE user_id = ?",
      [user_id, user_fname, user_lname, nickname, faculty, year, phone, login_id]
    );

    // ตรวจสอบว่ามีการอัปเดตข้อมูลหรือไม่
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }
  } catch (error) {
    // แสดงข้อผิดพลาดในระบบ
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


module.exports = router;
