const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection

const router = express.Router();
const secret = 'mysecret';

// Route: Register user


router.post('/register-manger', async (req, res) => {
  let conn;

  try {
    conn = await initMySQL(); // เชื่อมต่อฐานข้อมูล

    // รับข้อมูลจาก body ของคำขอ
    const { man_id, password, man_fname, man_lname, status } = req.body;

    // ตรวจสอบว่า input ทั้งหมดถูกส่งมาครบถ้วน
    if (!man_id || !password || !man_fname || !man_lname) {
      return res.status(400).json({
        message: 'Missing required fields: man_id, password, man_fname, man_lname, are required.',
      });
    }

    // ตรวจสอบว่ามี employee_id นี้อยู่ในฐานข้อมูลแล้วหรือไม่
    const [existingManger] = await conn.query(
      'SELECT man_id FROM manager WHERE man_id = ?',
      [man_id]
    );
    if (existingManger.length > 0) {
      return res.status(400).json({
        message: 'Employee ID already exists. Please use a different Employee ID.',
      });
    }

    // สร้าง hash ของรหัสผ่าน
    const passwordHash = await bcrypt.hash(password, 10);

    // ข้อมูลพนักงาน
    const mangerData = {
      man_id,
      man_fname,
      man_lname,
    };

    // ข้อมูลการล็อกอิน
    const loginData = {
      login_id: man_id,
      password: passwordHash,
      roles: 'manager', // กำหนดบทบาทเป็น 'employee'
    };

    // ใช้ transaction เพื่อบันทึกข้อมูลทั้งสองตาราง
    await conn.beginTransaction();

    // Insert ข้อมูลพนักงานลงในตาราง employee
    await conn.query('INSERT INTO manager SET ?', mangerData);

    // Insert ข้อมูลการล็อกอินลงในตาราง login
    await conn.query('INSERT INTO login SET ?', loginData);

    // ยืนยันการทำ transaction
    await conn.commit();

    // สร้าง JWT token สำหรับพนักงานใหม่
    const token = jwt.sign({ login_id: man_id }, secret, { expiresIn: '1h' });

    // ตั้งค่า token ลงใน cookie สำหรับพนักงาน (httpOnly สำหรับความปลอดภัย)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 ชั่วโมง
      sameSite: 'Strict',
    });

    // ตอบกลับด้วยข้อความสำเร็จและส่ง token ในคำตอบ
    res.json({
      message: 'Manager registered successfully',
      man_id,
      man_fname,
      man_lname,
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

router.post('/managerResult', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    // Query user information
    const [managerResult] = await conn.query("SELECT * FROM manager ");
  
    
    const managerinfo = managerResult;


    if (!managerinfo) {
      return res.status(404).json({ message: 'manager not found' });
    }

    res.json({
      manager: managerinfo,
    });
  } catch (error) {
    console.error('Error retrieving manager data:', error);
    res.status(500).json({ message: 'Error retrieving manager data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/managerUpdate', async (req, res) => {
  let conn = null;
  const { man_id, man_fname, man_lname } = req.body;

  try {
    conn = await initMySQL();

    if (!man_id || !man_fname || !man_lname) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน ",
      });
    }

    // คำสั่ง SQL ที่แก้ไข
    const [result] = await conn.query(
      "UPDATE manager SET man_fname = ?, man_lname = ? WHERE man_id = ?",
      [man_fname, man_lname, man_id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }
  } catch (error) {
    console.error('Error during Manager update:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/managerDelete', async (req, res) => {
  let conn = null;
  const { man_id } = req.body;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่ามี employee_id หรือไม่
    if (!man_id) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก employee_id เพื่อทำการลบข้อมูล"
      });
    }

    // เริ่มต้น transaction
    await conn.beginTransaction();

    // ลบข้อมูลจากตาราง employee
    const [managerResult] = await conn.query(
      "DELETE FROM manager WHERE man_id = ?",
      [man_id]
    );

    // ลบข้อมูลจากตาราง login
    const [loginResult] = await conn.query(
      "DELETE FROM login WHERE login_id = ?",
      [man_id]
    );

    // ตรวจสอบผลลัพธ์จากการลบ
    if (managerResult.affectedRows > 0 || loginResult.affectedRows > 0) {
      await conn.commit(); // ยืนยัน transaction

      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลพนักงานและข้อมูลเข้าสู่ระบบสำเร็จ'
      });
    } else {
      await conn.rollback(); // ยกเลิก transaction

      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลพนักงานหรือข้อมูลเข้าสู่ระบบที่ต้องการลบ'
      });
    }
  } catch (error) {
    console.error('Error during manager delete:', error.message);
    console.error('Stack trace:', error.stack);

    if (conn) {
      await conn.rollback(); // ยกเลิก transaction ในกรณีเกิดข้อผิดพลาด
    }

    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
      error: error.message
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});




module.exports = router;
