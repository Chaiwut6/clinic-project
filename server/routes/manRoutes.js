const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection

const router = express.Router();
const secret = 'mysecret';

// Route: Register user


router.post('/register-manager', async (req, res) => {
    let conn;
    try {
      conn = await initMySQL(); // เชื่อมต่อฐานข้อมูล
  
      const { man_id, password, status } = req.body;
  
      // ตรวจสอบว่า man_id นี้มีอยู่ในฐานข้อมูลหรือไม่
      const [existingManager] = await conn.query('SELECT man_id FROM manager WHERE man_id = ?', [man_id]);
      if (existingManager.length > 0) {
        return res.status(400).json({
          message: 'Manager ID already exists. Please use a different Manager ID.',
        });
      }
  
      // สร้าง hash ของรหัสผ่าน
      const passwordHash = await bcrypt.hash(password, 10);
  
      // ข้อมูลผู้จัดการ
      const managerData = {
        man_id,
      };
  
      // ข้อมูลการล็อกอิน
      const loginData = {
        login_id: man_id,
        password: passwordHash,
        roles: 'manager', // กำหนดบทบาทเป็น 'manager'
      };
  
      // ใช้ transaction เพื่อบันทึกข้อมูลทั้งสองตาราง
      await conn.beginTransaction();
  
      // Insert ข้อมูลการล็อกอินลงในตาราง login
      const [resultsLogin] = await conn.query('INSERT INTO login SET ?', loginData);
  
      // Insert ข้อมูลผู้จัดการลงในตาราง manager
      const [results] = await conn.query('INSERT INTO manager SET ?', managerData);
  
      // ยืนยันการทำ transaction
      await conn.commit();
  
      // สร้าง JWT token สำหรับผู้จัดการใหม่
      const token = jwt.sign({ login_id: man_id }, secret, { expiresIn: '1h' });
  
      // ตั้งค่า token ลงใน cookie สำหรับผู้จัดการ (httpOnly สำหรับความปลอดภัย)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 ชั่วโมง
        sameSite: 'Strict',
      });
  
      // ตอบกลับด้วยข้อความสำเร็จและส่งข้อมูลในคำตอบ
      res.json({
        message: 'Manager registered successfully',
        man_id,
        token, // ส่ง token ในคำตอบ
      });
    } catch (error) {
      // ยกเลิกการทำ transaction ในกรณีเกิดข้อผิดพลาด
      if (conn) await conn.rollback();
  
      console.error('Error during manager registration:', error);
  
      // ส่ง response ข้อผิดพลาดกลับไปยัง client
      res.status(500).json({
        message: 'Registration failed',
        error: error.message,
      });
    } finally {
      // ปิดการเชื่อมต่อฐานข้อมูล
      if (conn) await conn.end();
    }
  });
  

module.exports = router;
