const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection
const verifyToken = require('../middleware/verifyToken');
const router = express();
require('dotenv').config();
const secret = process.env.JWT_SECRET;

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
    const passwordHash = await bcrypt.hash(password, 12);

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
        message: 'ลบข้อมูลเจ้าหน้าที่และข้อมูลเข้าสู่ระบบสำเร็จ'
      });
    } else {
      await conn.rollback(); // ยกเลิก transaction

      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลเจ้าหน้าที่หรือข้อมูลเข้าสู่ระบบที่ต้องการลบ'
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

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const [userResult] = await conn.query("SELECT * FROM students");

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    // ดึงข้อมูลการนัดหมายล่าสุดของแต่ละ `stu_id` รวมถึง `caseStatus`
    const [appointmentsResult] = await conn.query(`
      SELECT a.stu_id, a.status, a.date, a.caseStatus
      FROM appointments a
      INNER JOIN (
          SELECT stu_id, MAX(date) AS latest_date
          FROM appointments
          GROUP BY stu_id
      ) latest 
      ON a.stu_id = latest.stu_id AND a.date = latest.latest_date
    `);

    // ใช้ `Map` เพื่อเชื่อมข้อมูล `appointments` กับ `students`
    const appointmentMap = new Map();
    appointmentsResult.forEach(app => {
      appointmentMap.set(app.stu_id, { 
        status: app.status, 
        date: app.date,
        caseStatus: app.caseStatus || "ไม่มีข้อมูล" // ป้องกัน `null` caseStatus
      });
    });

    // รวมข้อมูล `students` กับ `appointments` + `caseStatus`
    const userList = userResult.map(user => ({
      ...user,
      latest_appointment_status: appointmentMap.get(user.stu_id)?.status || "ไม่มีข้อมูล",
      latest_appointment_date: appointmentMap.get(user.stu_id)?.date || "ไม่มีข้อมูล",
      latest_case_status: appointmentMap.get(user.stu_id)?.caseStatus || "ไม่มีข้อมูล"
    }));

    // ส่งผลลัพธ์กลับไปที่ Client
    res.json({ students: userList });

  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });

  } finally {
    if (conn) {
      await conn.end();
    }
  }
});



router.post('/change-password', verifyToken, async (req, res) => {
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
  const { Appointment_id, stu_id, stu_fname, stu_lname, doc_id, doc_name, time_start, time_end, date, problem, status } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    // Debug: ดูข้อมูลที่ส่งมาจาก Frontend
    console.log("Request Body:", req.body);

    // ตรวจสอบข้อมูลว่ามีครบทุก Field ที่ต้องใช้หรือไม่
    if (!Appointment_id || !stu_id || !stu_fname || !stu_lname || !doc_id || !doc_name || !date || !problem || !status || !time_start || !time_end) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่าเวลานัดนี้ถูกจองไปแล้วหรือไม่
    const [existingAppointments] = await conn.query(
      "SELECT * FROM appointments WHERE doc_id = ? AND date = ? AND time_start = ? AND time_end = ?",
      [doc_id, date, time_start, time_end]
    );

    console.log("Existing Appointments:", existingAppointments);

    if (existingAppointments.length > 0) {
      const existingAppointment = existingAppointments[0];
      if (existingAppointment.status !== "ยกเลิก") {
        return res.status(400).json({ message: "เวลานัดหมายนี้ถูกจองไปแล้ว กรุณาเลือกเวลาอื่น" });
      }
    }

 
    const [latestSymptoms] = await conn.query(
      `SELECT symptoms 
       FROM appointments 
       WHERE stu_id = ? 
       AND date <= NOW()
       ORDER BY date DESC LIMIT 1`,
      [stu_id]
    );

    let symptoms = null;
    if (latestSymptoms.length > 0) {
      if (latestSymptoms[0].symptoms === null) {
        symptoms = null; 
      } else {
        try {
          // ถ้าเป็น JSON ที่ถูกต้องแล้ว ให้ใช้ตามเดิม
          symptoms = JSON.stringify(latestSymptoms[0].symptoms);
        } catch (error) {
          // ถ้าไม่ใช่ JSON ให้แปลงเป็น Array และ JSON.stringify()
          symptoms = JSON.stringify([latestSymptoms[0].symptoms]);
        }
      }
    }

    // ใช้ JSON.stringify() ก่อนบันทึก
    // const symptomsJson = JSON.stringify(symptoms);

    // สร้าง Appointment ID ใหม่สำหรับการนัดหมายใหม่
    const newAppointmentId = `APPT-${Date.now()}`;

    // เพิ่มการนัดหมายใหม่
    const appointmentData = {
      Appointment_id: newAppointmentId,
      stu_id,
      stu_fname,
      stu_lname,
      doc_id,
      doc_name,
      time_start,
      time_end,
      date,
      problem,
      status,
      symptoms: symptoms  
    };

    console.log("Appointment Data:", appointmentData);

    await conn.query('INSERT INTO appointments SET ?', appointmentData);

    res.status(201).json({ message: 'การนัดหมายถูกบันทึกเรียบร้อยแล้ว' });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกการนัดหมาย:', error);
    res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการบันทึกการนัดหมาย กรุณาลองใหม่อีกครั้ง',
      error: error.message,
      stack: error.stack
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});





router.post('/appointments-count', async (req, res) => {
  let conn;
  try {
    conn = await initMySQL();
    const { doc_id, date } = req.body; 

    if (!doc_id || !date) {
      return res.status(400).json({ message: "Missing doctor ID or date" });
    }

    const [result] = await conn.query(
      "SELECT COUNT(*) AS totalAppointments FROM appointments WHERE doc_id = ? AND date = ?",
      [doc_id, date]
    );

    res.json({ totalAppointments: result[0].totalAppointments });

  } catch (error) {
    console.error("Error fetching appointments count:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบจำนวนการนัดหมาย" });
  } finally {
    if (conn) await conn.end();
  }
});





router.post("/getAppointments", async (req, res) => {
  const { doc_id, date } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    const [appointments] = await conn.query(
      `
      SELECT date, time_start, time_end, status 
      FROM appointments
      WHERE doc_id = ? AND date = ? AND status != 'ยกเลิก'
      ORDER BY time_start
      `,
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


router.post('/Statusappointments', async (req, res) => {
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
      'UPDATE appointments SET status = ? WHERE Appointment_id = ?',
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

    const [user] = await conn.query("SELECT * FROM students WHERE stu_id = ?", [userId]);
    const [Result] = await conn.query("SELECT * FROM risk_results WHERE stu_id = ?", [userId]);
    const [Appointment] = await conn.query("SELECT * FROM appointments WHERE stu_id = ?", [userId]);

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

    // ค้นหานัดหมายล่าสุดของแต่ละ user (ที่ยังไม่ถูกปิดเคส)
    const [latestAppointments] = await conn.query(`
      SELECT a.* 
      FROM appointments a
      INNER JOIN (
          SELECT stu_id, MAX(date) AS latest_date
          FROM appointments
          WHERE status = 'ยืนยัน'
          GROUP BY stu_id
      ) latest ON a.stu_id = latest.stu_id AND a.date = latest.latest_date
      WHERE a.caseStatus != 'ปิดเคส' OR a.caseStatus IS NULL
    `);

    // ค้นหารายชื่อผู้ใช้ที่มีการนัดหมาย (และไม่ถูกปิดเคส)
    const [studentsWithAppointments] = await conn.query(`
      SELECT DISTINCT u.*
      FROM students u
      INNER JOIN appointments a ON u.stu_id = a.stu_id
      WHERE a.caseStatus != 'ปิดเคส' OR a.caseStatus IS NULL
    `);

    // ตรวจสอบข้อมูล
    const userinfo = studentsWithAppointments.length > 0 ? studentsWithAppointments : [{ message: "ไม่พบผู้ใช้งานที่มีการนัดหมาย" }];
    const userAppointment = latestAppointments.length > 0 ? latestAppointments : [{ message: "ยังไม่มีการนัดหมาย" }];

    res.json({
      students: userinfo,
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
  const { stu_id } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    const [user] = await conn.query("SELECT * FROM students WHERE stu_id = ?", [stu_id]);


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

router.post("/closeCase", async (req, res) => {
  const { stu_id } = req.body;
  let conn = null;

  try {
    conn = await initMySQL();

    if (!stu_id) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกผู้ใช้งานที่ต้องการปิดเคส",
      });
    }

    // ค้นหา Appointment ที่ยืนยันล่าสุด (ไม่ใช่ "ยกเลิก")
    const [latestConfirmedAppointment] = await conn.query(
      `SELECT Appointment_id 
       FROM appointments 
       WHERE stu_id = ? AND status = 'ยืนยัน' 
       ORDER BY date DESC, time_start DESC 
       LIMIT 1`,
      [stu_id]
    );

    if (latestConfirmedAppointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการนัดหมายที่ยืนยันล่าสุด",
      });
    }

    // อัปเดตสถานะของการนัดหมายที่ยืนยันล่าสุดเป็น "ปิดเคส"
    const appointmentId = latestConfirmedAppointment[0].Appointment_id;
    const [updateResult] = await conn.query(
      "UPDATE appointments SET status = 'ปิดเคส' WHERE Appointment_id = ?",
      [appointmentId]
    );

    if (updateResult.affectedRows > 0) {
      res.status(200).json({ success: true, message: "ปิดเคสสำเร็จ" });
    } else {
      res.status(500).json({ success: false, message: "ไม่สามารถปิดเคสได้" });
    }
  } catch (error) {
    console.error("Error closing case:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ", error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/appointmentCount', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();
    const [result] = await conn.query("SELECT COUNT(*) AS count FROM appointments");

    res.json({
      success: true,
      appointmentCount: result[0]?.count || 0, // ถ้าค่าเป็น null ให้แสดง 0
    });

  } catch (error) {
    console.error('Error retrieving appointment count:', error);
    res.status(500).json({ success: false, message: 'Error retrieving appointment count', error: error.message });

  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post("/casesStatus", async (req, res) => {
  let conn;
  try {
      conn = await initMySQL();
      const { stu_id, status } = req.body;

      if (!stu_id || !status) {
          return res.status(400).json({ success: false, message: "Missing stu_id or status" });
      }

      
      const [existingUser] = await conn.query("SELECT * FROM appointments WHERE stu_id = ?", [stu_id]);


      if (existingUser.length === 0) {
          return res.status(404).json({ success: false, message: "ไม่พบข้อมูลของผู้ใช้" });
      }

      await conn.query("UPDATE appointments SET caseStatus = ? WHERE stu_id = ?", [status, stu_id]);

      res.json({ success: true, message: "Case status updated successfully" });


  } catch (error) {
      console.error("Error updating case status:", error);
      res.status(500).json({ success: false, message: "Failed to update case status" });
  } finally {
      if (conn) await conn.end();
  }
});

router.post("/showcasesStatus", async (req, res) => {
  let conn;
  try {
      conn = await initMySQL();
      const { stu_id } = req.body;

      const [result] = await conn.query("SELECT caseStatus FROM appointments WHERE stu_id = ?", [stu_id]);

      if (result.length === 0) {
          return res.json({ success: false, message: "ไม่พบข้อมูลสถานะ" });
      }

      res.json({ success: true, status: result[0].caseStatus });
  } catch (error) {
      console.error("Error fetching case status:", error);
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  } finally {
      if (conn) await conn.end();
  }
});


router.post('/confirmedAppointmentCount', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();
    const [result] = await conn.query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'ยืนยัน'");

    res.json({
      success: true,
      confirmedAppointmentCount: result[0]?.count || 0, // ถ้าค่าเป็น null ให้แสดง 0
    });

  } catch (error) {
    console.error('Error retrieving confirmed appointment count:', error);
    res.status(500).json({ success: false, message: 'Error retrieving confirmed appointment count', error: error.message });

  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/closedCasesCount', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();
    const [result] = await conn.query("SELECT COUNT(*) AS count FROM appointments WHERE caseStatus = 'ปิดเคส'");

    res.json({
      success: true,
      closedCasesCount: result[0]?.count || 0, // ถ้าค่าเป็น null ให้แสดง 0
    });

  } catch (error) {
    console.error('Error retrieving closed cases count:', error);
    res.status(500).json({ success: false, message: 'Error retrieving closed cases count', error: error.message });

  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/appointmentsOverview', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    const { year, month } = req.body;
    const selectedYear = year || new Date().getFullYear();
    const selectedMonth = month ? `AND MONTH(date) = ${month}` : "";

    const [appointments] = await conn.query(`
          SELECT 
              DATE_FORMAT(a.date, '%Y-%m') AS month,
              COUNT(*) AS total,
              SUM(CASE WHEN a.status = 'ยืนยัน' THEN 1 ELSE 0 END) AS confirmed,
              SUM(CASE WHEN a.status = 'ยกเลิก' THEN 1 ELSE 0 END) AS cancelled,
              SUM(CASE WHEN a.status = 'รอการยืนยัน' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN a.caseStatus = 'ติดตามอาการ' THEN 1 ELSE 0 END) AS followUp,
              SUM(CASE WHEN a.caseStatus = 'ปิดเคส' THEN 1 ELSE 0 END) AS closedCaseStatus
          FROM appointments a
          WHERE YEAR(a.date) = ? ${selectedMonth}
          AND a.date = (
              SELECT MAX(a2.date) FROM appointments a2 
              WHERE a2.stu_id = a.stu_id AND YEAR(a2.date) = ?
          )
          GROUP BY month
          ORDER BY month;
      `, [selectedYear, selectedYear]);

    res.json({
      success: true,
      appointments,
    });

  } catch (error) {
    console.error('Error fetching appointment overview:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  } finally {
    if (conn) await conn.end();
  }
});


router.post('/appointmentsByFaculty', async (req, res) => {
  let conn = null;
  try {
    conn = await initMySQL();
    const { year, symptom, faculty } = req.body;
    const selectedYear = year || new Date().getFullYear();

    let query = `
      SELECT 
          u.faculty, 
          COUNT(DISTINCT a.stu_id) AS total_patients, 
          symptom_details.symptom AS symptom_name
      FROM appointments a
      JOIN students u ON a.stu_id = u.stu_id
      JOIN JSON_TABLE(
          CAST(a.symptoms AS JSON), 
          '$[*]' COLUMNS (
              symptom VARCHAR(255) PATH '$'
          )
      ) symptom_details ON 1=1
      WHERE a.status = 'ยืนยัน' 
      AND YEAR(a.date) = ?
      AND JSON_LENGTH(a.symptoms) > 0
      ${faculty ? "AND u.faculty = ?" : ""}
      ${symptom ? "AND symptom_details.symptom = ?" : ""}
      GROUP BY u.faculty, symptom_details.symptom
      ORDER BY total_patients DESC;
    `;

    let params = [selectedYear];
    if (faculty) params.push(faculty);
    if (symptom) params.push(symptom);

    const [facultyAppointments] = await conn.query(query, params);

    let facultyData = {};
    facultyAppointments.forEach(row => {
      if (!facultyData[row.faculty]) {
        facultyData[row.faculty] = { total: 0, symptoms: {} };
      }

      facultyData[row.faculty].total += row.total_patients;

      if (!facultyData[row.faculty].symptoms[row.symptom_name]) {
        facultyData[row.faculty].symptoms[row.symptom_name] = 0;
      }
      facultyData[row.faculty].symptoms[row.symptom_name] += row.total_patients;
    });

    const formattedData = Object.keys(facultyData).map(faculty => ({
      faculty,
      total: facultyData[faculty].total,
      symptoms: facultyData[faculty].symptoms
    }));

    res.json({
      success: true,
      appointments: formattedData,
      totalConfirmedAppointments: formattedData.reduce((sum, row) => sum + row.total, 0)
    });

  } catch (error) {
    console.error('Error fetching confirmed appointments by faculty:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  } finally {
    if (conn) await conn.end();
  }
});



// router.post('/appointmentsByFaculty', async (req, res) => {
//   let conn = null;
//   try {
//     conn = await initMySQL();
//     const { year, symptom, faculty } = req.body;

//     const selectedYear = year || new Date().getFullYear();

//     let query = `
//     SELECT u.faculty, COUNT(DISTINCT a.stu_id) AS total, JSON_UNQUOTE(JSON_EXTRACT(a.symptoms, '$')) AS symptoms
//     FROM appointments a
//     JOIN students u ON a.stu_id = u.stu_id
//     JOIN (
//         SELECT stu_id, MAX(date) AS latest_date 
//         FROM appointments 
//         WHERE status = 'ยืนยัน' 
//         AND (caseStatus = 'ติดตามอาการ' OR caseStatus IS NULL) 
//         GROUP BY stu_id
//     ) latest_appointments
//     ON a.stu_id = latest_appointments.stu_id 
//     AND a.date = latest_appointments.latest_date
//     WHERE a.status = 'ยืนยัน' 
//     AND YEAR(a.date) = ?
//     AND a.symptoms IS NOT NULL 
//     AND a.symptoms != '[]' 
//     ${faculty ? "AND u.faculty = ?" : ""}
//     GROUP BY u.faculty, a.symptoms
// `;

// let params = faculty ? [selectedYear, faculty] : [selectedYear];
// const [facultyAppointments] = await conn.query(query, params);

//     // ✅ แปลงข้อมูล JSON อาการให้ถูกต้อง
//     let facultyData = {};
//     facultyAppointments.forEach(row => {
//       let symptomsArray = [];
//       try {
//         symptomsArray = JSON.parse(row.symptoms || "[]");
//       } catch (error) {
//         symptomsArray = [];
//       }

//       if (!facultyData[row.faculty]) {
//         facultyData[row.faculty] = { total: 0, symptoms: {} };
//       }

//       // ✅ กรองตามอาการที่เลือก และป้องกันการนับซ้ำ
//       if (!symptom || symptomsArray.includes(symptom)) {
//         facultyData[row.faculty].total += row.total;

//         symptomsArray.forEach(symptomName => {
//           if (!facultyData[row.faculty].symptoms[symptomName]) {
//             facultyData[row.faculty].symptoms[symptomName] = 0;
//           }
//           facultyData[row.faculty].symptoms[symptomName] += row.total;
//         });
//       }
//     });

//     // ✅ แปลงข้อมูลให้อยู่ในรูปแบบ Array
//     const formattedData = Object.keys(facultyData).map(faculty => ({
//       faculty,
//       total: facultyData[faculty].total,
//       symptoms: facultyData[faculty].symptoms
//     }));

//     res.json({
//       success: true,
//       appointments: formattedData,
//       totalConfirmedAppointments: formattedData.reduce((sum, row) => sum + row.total, 0)
//     });

//   } catch (error) {
//     console.error('Error fetching confirmed appointments by faculty:', error);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
//   } finally {
//     if (conn) await conn.end();
//   }
// });





router.post('/saveSymptoms', async (req, res) => {
  let conn;
  try {
    const { stu_id, symptoms, additionalSymptom } = req.body;

    if (!stu_id || !symptoms) {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    conn = await initMySQL();

    // ดึง Appointment_id ล่าสุดของ user นี้
    // const [latestAppointment] = await conn.query(
    //   "SELECT Appointment_id FROM appointments WHERE stu_id = ? AND status = 'ยืนยัน' AND date <= NOW() ORDER BY date DESC LIMIT 1",
    //   [stu_id]
    // );
    const [latestAppointment] = await conn.query(
      "SELECT Appointment_id FROM appointments WHERE stu_id = ? ORDER BY date DESC LIMIT 1",
      [stu_id]
    );

    if (!latestAppointment.length) {
      return res.status(404).json({ message: "ไม่พบวันนัดล่าสุดของผู้ใช้" });
    }

    const appointment_id = latestAppointment[0].Appointment_id;

    // รวมอาการเก่ากับอาการใหม่
    let allSymptoms = Array.isArray(symptoms) ? [...symptoms] : [];
    if (additionalSymptom && additionalSymptom.trim() !== '') {
      allSymptoms.push(additionalSymptom.trim());
    }

    // อัปเดตอาการในวันนัดล่าสุด
    await conn.query(
      "UPDATE appointments SET symptoms = ? WHERE Appointment_id = ?",
      [JSON.stringify(allSymptoms), appointment_id]
    );

    res.status(200).json({ message: 'บันทึกอาการสำเร็จ' });

  } catch (error) {
    console.error("Error saving symptoms:", error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
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

router.post('/reset-password', async (req, res) => {
  let conn = null;
  try {
    const { stu_id } = req.body;

    console.log(" Received stu_id:", stu_id); // ดูค่า stu_id ที่ส่งมา

    if (!stu_id) {
      return res.status(400).json({ message: 'กรุณาระบุ User ID' });
    }

    conn = await initMySQL();

    // ตรวจสอบว่า User ID นี้มีอยู่จริงหรือไม่
    const [rows] = await conn.query("SELECT login_id FROM login WHERE login_id = ?", [stu_id]);
    console.log(" Found User:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ User ID ในระบบ' });
    }

   
    let newPassword = stu_id.slice(-7); 
    newPassword = newPassword.replace(/-/g, ''); 


    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const [result] = await conn.query(
      "UPDATE login SET password = ? WHERE login_id = ?",
      [hashedPassword, stu_id]
    );

    console.log(" Update Result:", result);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: `รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่คือ: ${newPassword}` });
    } else {
      res.status(404).json({ message: 'ไม่พบ User ID ในระบบ' });
    }
  } catch (error) {
    console.error('Error during password reset:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});






module.exports = router;
