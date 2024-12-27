const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
const secret = 'mysecret';

// Route: Register user
router.post('/register-doctor', async (req, res) => {
  let conn;

  try {
    // เชื่อมต่อฐานข้อมูล
    conn = await initMySQL();

    // รับข้อมูลจาก request body
    const { doc_id, doc_name, phone, status } = req.body;

    // ตรวจสอบข้อมูล input ว่าครบถ้วน
    if (!doc_id || !doc_name || !phone) {
      return res.status(400).json({
        message: 'Missing required fields: doc_id, doc_name, and phone are required.',
      });
    }

    // ตรวจสอบว่า doc_id มีอยู่ในฐานข้อมูลแล้วหรือไม่
    const [existingDoctor] = await conn.query(
      'SELECT doc_id FROM doctor WHERE doc_id = ?',
      [doc_id]
    );
    if (existingDoctor.length > 0) {
      return res.status(400).json({
        message: 'Doctor ID already exists. Please use a different Doctor ID.',
      });
    }

    // สร้างข้อมูลสำหรับการบันทึกในตาราง doctor
    const doctorData = {
      doc_id,
      doc_name,
      phone,
      // roles: 'doctor', // กำหนดบทบาทให้เป็น 'doctor'
    };

    // สร้างข้อมูล login
    // const loginData = {
    //   login_id: doc_id,
    //   roles: 'doctor',
    // };

    // ใช้ transaction ในการบันทึกข้อมูลทั้งสองตาราง
    await conn.beginTransaction();

    // บันทึกข้อมูลในตาราง doctor
    const [doctorResults] = await conn.query('INSERT INTO doctor SET ?', doctorData);

    // บันทึกข้อมูลในตาราง login
    // const [loginResults] = await conn.query('INSERT INTO login SET ?', loginData);

    // ยืนยันการทำ transaction
    await conn.commit();

    // สร้าง JWT token สำหรับแพทย์ใหม่
    const token = jwt.sign({ login_id: doc_id }, secret, { expiresIn: '1h' });

    // ตั้งค่า cookie สำหรับ JWT token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // อายุ cookie 1 ชั่วโมง
      sameSite: 'Strict',
    });

    // ส่ง response กลับไปยัง client
    res.json({
      message: 'Doctor registration successful',
      doctor: {
        doc_id,
        doc_name,
        phone,
      },
      token, // ส่ง token ใน response
    });
  } catch (error) {
    // ยกเลิก transaction หากเกิดข้อผิดพลาด
    if (conn) await conn.rollback();

    console.error('Error during doctor registration:', error);

    // ส่ง response ข้อผิดพลาดกลับไปยัง client
    res.status(500).json({
      message: 'Doctor registration failed',
      error: error.message,
    });
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    if (conn) {
      await conn.end();
    }
  }
});


  router.post("/login-doctor", async (req, res) => {
    let conn;
    try {
      conn = await initMySQL(); // Connect to MySQL
      const { doc_id, password } = req.body;
  
      // Query to check if the doctor exists in the database
      const [results] = await conn.query("SELECT * FROM doctor WHERE doc_id = ?", [doc_id]);
      const userData = results[0];
  
      if (!userData) {
        return res.status(400).json({
          message: 'Login failed (wrong userid)'
        });
      }
  
      // Verify password with bcrypt
      const match = await bcrypt.compare(password, userData.password);
      if (!match) {
        return res.status(400).json({
          message: 'Login failed (wrong password)'
        });
      }
  
      // Create JWT token with expiration time of 1 hour
      const token = jwt.sign({ doc_id, role: 'doctor' }, secret, { expiresIn: '1h' });
  
      // Send the token and role in the response
      const roles = userData.roles;
      res.json({
        roles,
        message: 'Login success',
        token
      });
  
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({
        message: 'Login failed',
        error: error.message || error
      });
    }
  });
  
  router.post('/doctorResult', async (req, res) => {
    let conn = null;
  
    try {
      conn = await initMySQL();
  
      // Query user information
      const [doctorResults] = await conn.query("SELECT * FROM doctor ");
    
      
      const doctorInfo = doctorResults;
  
  
      if (!doctorInfo) {
        return res.status(404).json({ message: 'doctor not found' });
      }
  
      res.json({
        doctor: doctorInfo,
      });
      
    } catch (error) {
      console.error('Error retrieving doctor data:', error);
      res.status(500).json({ message: 'Error retrieving doctor data', error: error.message });
    } finally {
      if (conn) {
        await conn.end();
      }
    }
  });
  

module.exports = router;
