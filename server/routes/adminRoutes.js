const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();
const router = express.Router();
const secret = process.env.JWT_SECRET;

// Route: Register user


router.post('/register-admin', async (req, res) => {
  let conn;

  try {
    conn = await initMySQL(); // เชื่อมต่อฐานข้อมูล

    // รับข้อมูลจาก body ของคำขอ
    const { admin_id, password, adm_fname, adm_lname, status } = req.body;

    // ตรวจสอบว่า input ทั้งหมดถูกส่งมาครบถ้วน
    if (!admin_id || !password || !adm_fname || !adm_lname) {
      return res.status(400).json({
        message: 'Missing required fields: admin_id, password, adm_fname, adm_lname, are required.',
      });
    }

    const [existingAdmin] = await conn.query(
      'SELECT admin_id FROM admin WHERE admin_id = ?',
      [admin_id]
    );
    if (existingAdmin.length > 0) {
      return res.status(400).json({
        message: 'Admin ID already exists. Please use a different Admin ID.',
      });
    }

    
    const passwordHash = await bcrypt.hash(password, 12);

  
    const adminData = {
        admin_id,
        adm_fname,
        adm_lname,
    };

    // ข้อมูลการล็อกอิน
    const loginData = {
      login_id: admin_id,
      password: passwordHash,
      roles: 'admin', 
    };


    await conn.beginTransaction();

   
    await conn.query('INSERT INTO admin SET ?', adminData);

  
    await conn.query('INSERT INTO login SET ?', loginData);

    await conn.commit();

    // สร้าง JWT token สำหรับพนักงานใหม่
    const token = jwt.sign({ login_id: admin_id }, secret, { expiresIn: '1h' });

    // ตั้งค่า token ลงใน cookie สำหรับพนักงาน (httpOnly สำหรับความปลอดภัย)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 ชั่วโมง
      sameSite: 'Strict',
    });

    // ตอบกลับด้วยข้อความสำเร็จและส่ง token ในคำตอบ
    res.json({
      message: 'Admin registered successfully',
      admin_id,
      adm_fname,
      adm_lname,
      token, // ส่ง token ในคำตอบ
    });
  } catch (error) {
    // ยกเลิกการทำ transaction ในกรณีเกิดข้อผิดพลาด
    if (conn) await conn.rollback();

    console.error('Error during manger registration:', error);

    // ส่ง response ข้อผิดพลาดกลับไปยัง client
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  } finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/admininfo', verifyToken, async (req, res) => {
  let conn;

  try {
    const login_id = req.user?.login_id;
    if (!login_id) {
      return res.status(400).json({ message: 'Invalid or missing login ID' });
    }

    conn = await initMySQL();


    const [adminResults] = await conn.query(
      'SELECT * FROM admin WHERE admin_id = ?',
      [login_id]
    );


    if (adminResults.length === 0) {
      return res.status(404).json({ message: 'admin not found' });
    }

    const adminInfo = adminResults[0];

    res.status(200).json({
      message: 'Employee data retrieved successfully',
      admin: adminInfo,
    });
  } catch (error) {

    console.error('Error retrieving employee data:', error);

    res.status(500).json({
      message: 'Error retrieving employee data',
      error: error.message || 'Internal Server Error',
    });
  } finally {

    if (conn) {
      try {
        await conn.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});

module.exports = router;