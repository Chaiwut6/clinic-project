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

router.post('/employeeUpdate', async (req, res) => {
  let conn = null;
  const { employee_id, emp_fname, emp_lname } = req.body;

  try {
    conn = await initMySQL();

    if (!employee_id || !emp_fname || !emp_lname) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน ",
      });
    }

    // คำสั่ง SQL ที่แก้ไข
    const [result] = await conn.query(
      "UPDATE employee SET emp_fname = ?, emp_lname = ? WHERE employee_id = ?",
      [emp_fname, emp_lname, employee_id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }
  } catch (error) {
    console.error('Error during doctor update:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/employeeDelete', async (req, res) => {
  let conn = null;
  const { employee_id } = req.body;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่ามี employee_id หรือไม่
    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก employee_id เพื่อทำการลบข้อมูล"
      });
    }

    // เริ่มต้น transaction
    await conn.beginTransaction();

    // ลบข้อมูลจากตาราง employee
    const [employeeResult] = await conn.query(
      "DELETE FROM employee WHERE employee_id = ?",
      [employee_id]
    );

    // ลบข้อมูลจากตาราง login
    const [loginResult] = await conn.query(
      "DELETE FROM login WHERE login_id = ?",
      [employee_id]
    );

    // ตรวจสอบผลลัพธ์จากการลบ
    if (employeeResult.affectedRows > 0 || loginResult.affectedRows > 0) {
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
    console.error('Error during employee delete:', error.message);
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


router.post('/userList', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    // Query user information
    const [userResult] = await conn.query("SELECT * FROM users ");
  
    
    const userList = userResult;


    if (!userList) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.json({
      user: userList,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/change-password', verifyToken , async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const login_id = req.user.login_id;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    });
  }

  let conn = null;
  try {
    conn = await initMySQL();

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
    }

    // ค้นหาผู้ใช้จาก login_id
    const [employeeLogin] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    if (!employeeLogin || employeeLogin.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const employeeInfo = employeeLogin[0];

    // ตรวจสอบว่ารหัสผ่านเดิมถูกต้องหรือไม่
    const isMatch = await bcrypt.compare(oldPassword, employeeInfo.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ไม่เหมือนกับรหัสผ่านเก่า
    const isSamePassword = await bcrypt.compare(newPassword, employeeInfo.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเก่า' });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    const [result] = await conn.query("UPDATE login SET password = ? WHERE login_id = ?", [hashedPassword, login_id]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'ไม่สามารถอัปเดตรหัสผ่านได้' });
    }

    // ส่งคำตอบสำเร็จ
    res.status(200).json({ message: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว' });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดระหว่างการอัพเดตรหัสผ่าน:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/appointments', async (req, res) => {
  const { Appointment_id, user_id, user_fname, user_lname, doc_id, doc_name, time_start, time_end, date, problem, status } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่า req.body มีข้อมูลครบถ้วน
    if (!Appointment_id || !user_id || !user_fname || !user_lname || !doc_id || !doc_name || !date || !problem || !status || !time_start || !time_end) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน' // ส่งข้อความแจ้งเตือน
      });
    }

    // ตรวจสอบการซ้ำของเวลานัดหมายสำหรับหมอคนเดียวกัน
    const conflictCheckQuery = `
      SELECT * FROM Appointment
      WHERE doc_id = ?
      AND date = ?
      AND (
        (time_start < ? AND time_end > ?) OR
        (time_start < ? AND time_end > ?) OR
        (time_start = ? AND time_end = ?)
      )
    `;

    const [conflicts] = await conn.query(conflictCheckQuery, [
      doc_id,
      date,
      time_end,
      time_start,
      time_start,
      time_end,
      time_start,
      time_end,
    ]);

    console.log('Query Executed');
    console.log('Conflicts:', conflicts); // ตรวจสอบค่าที่ได้จากฐานข้อมูล

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: 'เวลาที่เลือกมีการนัดหมายซ้ำ กรุณาเลือกเวลาอื่น' 
      });
    }

    // ถ้าไม่มีการซ้ำ ให้บันทึกข้อมูล
    const appointmentData = {
      Appointment_id,
      user_id,
      user_fname,
      user_lname,
      doc_id,
      doc_name,
      time_start,
      time_end,
      date,
      problem,
      status,
    };

    // บันทึกข้อมูลลงในตาราง appointments
    await conn.query('INSERT INTO Appointment SET ?', appointmentData);

    // ส่ง response กลับไปยัง client
    res.status(201).json({
      message: 'การนัดหมายถูกบันทึกเรียบร้อยแล้ว' // ส่งข้อความแจ้งเตือนการบันทึกสำเร็จ
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกการนัดหมาย:', error);
    res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการบันทึกการนัดหมาย กรุณาลองใหม่อีกครั้ง',
      error: error.message
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post("/getAppointments", async (req, res) => {
  const { doc_id, date } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    const [appointments] = await conn.query(
      "SELECT date, time_start, time_end FROM Appointment WHERE doc_id = ? AND date = ? ORDER BY time_start",
      [doc_id, date]
    );

    res.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการนัดหมาย",
      error: error.message,
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});





router.post('/appointmentscancel', async (req, res) => {
  const { Appointment_id, status } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่า appointment_id และ status ถูกส่งเข้ามา
    if (!Appointment_id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // อัพเดตสถานะเป็น 'ยกเลิก'
    const result = await conn.query(
      'UPDATE Appointment SET status = ? WHERE Appointment_id = ?',
      [status, Appointment_id]
    );

    // ตรวจสอบว่าแถวถูกอัพเดตหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});



router.post('/userdetails', async (req, res) => {
  const { userId } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    const [user] = await conn.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    const [Result] = await conn.query("SELECT * FROM results WHERE user_id = ?", [userId]);
    const [Appointment] = await conn.query("SELECT * FROM Appointment WHERE user_id = ?", [userId]);

    const userinfo = user;
    const userdetails = Result;
    const userAppointment = Appointment.length > 0 ? Appointment : [{ message: "ยังไม่มีการนัดหมาย" }];

    if (!userinfo) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.json({
      user: userinfo,
      results: userdetails,
      appointments: userAppointment,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/receivecare', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    // ดึงข้อมูล Appointment โดยเรียงลำดับจากวันที่ล่าสุด
    const [appointments] = await conn.query(`
      SELECT * 
      FROM Appointment 
    `);

    // ดึงเฉพาะ users ที่มีการนัดหมายใน Appointment
    const [usersWithAppointments] = await conn.query(`
      SELECT DISTINCT u.*
      FROM users u
      INNER JOIN Appointment a ON u.user_id = a.user_id
    `);

    // ตรวจสอบข้อมูล
    const userinfo = usersWithAppointments.length > 0 ? usersWithAppointments : [{ message: "ไม่พบผู้ใช้งานที่มีการนัดหมาย" }];
    const userAppointment = appointments.length > 0 ? appointments : [{ message: "ยังไม่มีการนัดหมาย" }];

    res.json({
      users: userinfo,
      appointments: userAppointment,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});


router.post('/userfetch', async (req, res) => {
  const { user_id } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    const [user] = await conn.query("SELECT * FROM users WHERE user_id = ?", [user_id]);


    const userinfo = user;
 

    if (!userinfo) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.json({
      user: userinfo,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});



  

module.exports = router;
