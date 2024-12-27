const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
const secret = 'mysecret';

// Route: Register user

router.post('/register-employee', async (req, res) => {
  let conn;

  try {
    conn = await initMySQL(); // เชื่อมต่อฐานข้อมูล

    // รับข้อมูลจาก body ของคำขอ
    const { employee_id, password, emp_fname, emp_lname, status } = req.body;

    // ตรวจสอบว่า input ทั้งหมดถูกส่งมาครบถ้วน
    if (!employee_id || !password || !emp_fname || !emp_lname) {
      return res.status(400).json({
        message: 'Missing required fields: employee_id, password, emp_fname, emp_lname are required.',
      });
    }

    // ตรวจสอบว่ามี employee_id นี้อยู่ในฐานข้อมูลแล้วหรือไม่
    const [existingEmployee] = await conn.query(
      'SELECT employee_id FROM employee WHERE employee_id = ?',
      [employee_id]
    );
    if (existingEmployee.length > 0) {
      return res.status(400).json({
        message: 'Employee ID already exists. Please use a different Employee ID.',
      });
    }

    // สร้าง hash ของรหัสผ่าน
    const passwordHash = await bcrypt.hash(password, 10);

    // ข้อมูลพนักงาน
    const employeeData = {
      employee_id,
      emp_fname,
      emp_lname,
    };

    // ข้อมูลการล็อกอิน
    const loginData = {
      login_id: employee_id,
      password: passwordHash,
      roles: 'employee', // กำหนดบทบาทเป็น 'employee'
    };

    // ใช้ transaction เพื่อบันทึกข้อมูลทั้งสองตาราง
    await conn.beginTransaction();

    // Insert ข้อมูลพนักงานลงในตาราง employee
    await conn.query('INSERT INTO employee SET ?', employeeData);

    // Insert ข้อมูลการล็อกอินลงในตาราง login
    await conn.query('INSERT INTO login SET ?', loginData);

    // ยืนยันการทำ transaction
    await conn.commit();

    // สร้าง JWT token สำหรับพนักงานใหม่
    const token = jwt.sign({ login_id: employee_id }, secret, { expiresIn: '1h' });

    // ตั้งค่า token ลงใน cookie สำหรับพนักงาน (httpOnly สำหรับความปลอดภัย)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 ชั่วโมง
      sameSite: 'Strict',
    });

    // ตอบกลับด้วยข้อความสำเร็จและส่ง token ในคำตอบ
    res.json({
      message: 'Employee registered successfully',
      employee_id,
      emp_fname,
      emp_lname,
      token, // ส่ง token ในคำตอบ
    });
  } catch (error) {
    // ยกเลิกการทำ transaction ในกรณีเกิดข้อผิดพลาด
    if (conn) await conn.rollback();

    console.error('Error during employee registration:', error);

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


router.post('/employeeinfo', verifyToken, async (req, res) => {
  let conn;

  try {

    const login_id = req.user?.login_id;


    if (!login_id) {
      return res.status(400).json({ message: 'Invalid or missing login ID' });
    }

    conn = await initMySQL();


    const [employeeResults] = await conn.query(
      'SELECT * FROM employee WHERE employee_id = ?',
      [login_id]
    );


    if (employeeResults.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeInfo = employeeResults[0];

    res.status(200).json({
      message: 'Employee data retrieved successfully',
      employee: employeeInfo,
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

router.post('/employeeResult', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    // Query user information
    const [employeeResult] = await conn.query("SELECT * FROM employee ");
  
    
    const employeeinfo = employeeResult;


    if (!employeeinfo) {
      return res.status(404).json({ message: 'employee not found' });
    }

    res.json({
      employee: employeeinfo,
    });
  } catch (error) {
    console.error('Error retrieving employee data:', error);
    res.status(500).json({ message: 'Error retrieving employee data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

  

module.exports = router;
