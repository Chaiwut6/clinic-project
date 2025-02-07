const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initMySQL = require('../database'); // Import database connection
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
require('dotenv').config();
const secret = process.env.JWT_SECRET;

// Route: Register user
router.post("/register-doctor", async (req, res) => {
  let conn;

  try {
    // เชื่อมต่อฐานข้อมูล
    conn = await initMySQL();

    // รับข้อมูลจาก request body
    const { doc_id, password, doc_name, phone, status } = req.body;

    // ตรวจสอบข้อมูล input ว่าครบถ้วน
    if (!doc_id || !password || !doc_name || !phone) {
      return res.status(400).json({
        message: 'Missing required fields: doc_id,password, doc_name, and phone are required.',
      });
    }

    // ฟังก์ชันสร้าง doc_id แบบไม่ซ้ำ
    async function generateDoctorID() {
      const [rows] = await conn.query(
        "SELECT MAX(doc_id) AS maxID FROM doctor"
      );

      const maxID = rows[0].maxID;

      if (!maxID) {
        // ถ้าไม่มี ID ในระบบ ให้เริ่มต้นที่ 1
        return `DOC001`;
      }

      // แยกรหัสลำดับที่ และเพิ่ม 1
      const currentNumber = parseInt(maxID.slice(3)) + 1;
      return `DOC${String(currentNumber).padStart(3, "0")}`;
    }

    // สร้าง doc_id ใหม่
    // const doc_id = await generateDoctorID();
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

    const passwordHash = await bcrypt.hash(password, 12);

    // สร้างข้อมูลสำหรับการบันทึกในตาราง doctor
    const doctorData = {
      doc_id,
      doc_name,
      phone,
    };

    
    const loginData = {
      login_id: doc_id,
      password: passwordHash,
      roles: 'doctor',
    };

    // ใช้ transaction ในการบันทึกข้อมูล
    await conn.beginTransaction();

    // บันทึกข้อมูลในตาราง doctor
    const [doctorResults] = await conn.query("INSERT INTO doctor SET ?", doctorData);
    const [loginResults] = await conn.query('INSERT INTO login SET ?', loginData);

    // ยืนยันการทำ transaction
    await conn.commit();
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

    console.error("Error during doctor registration:", error);

    // ส่ง response ข้อผิดพลาดกลับไปยัง client
    res.status(500).json({
      message: "Doctor registration failed",
      error: error.message,
    });
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    if (conn) {
      await conn.end();
    }
  }
});




// router.post("/login-doctor", async (req, res) => {
//   let conn;
//   try {
//     conn = await initMySQL(); // Connect to MySQL
//     const { doc_id, password } = req.body;

//     // Query to check if the doctor exists in the database
//     const [results] = await conn.query("SELECT * FROM doctor WHERE doc_id = ?", [doc_id]);
//     const userData = results[0];

//     if (!userData) {
//       return res.status(400).json({
//         message: 'Login failed (wrong userid)'
//       });
//     }

//     // Verify password with bcrypt
//     const match = await bcrypt.compare(password, userData.password);
//     if (!match) {
//       return res.status(400).json({
//         message: 'Login failed (wrong password)'
//       });
//     }

//     // Create JWT token with expiration time of 1 hour
//     const token = jwt.sign({ doc_id, role: 'doctor' }, secret, { expiresIn: '1h' });

//     // Send the token and role in the response
//     const roles = userData.roles;
//     res.json({
//       roles,
//       message: 'Login success',
//       token
//     });

//   } catch (error) {
//     console.log('Error:', error);
//     res.status(500).json({
//       message: 'Login failed',
//       error: error.message || error
//     });
//   }
// });

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
    const [doctorLogin] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    if (!doctorLogin || doctorLogin.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const doctorInfo = doctorLogin[0];

    // ตรวจสอบว่ารหัสผ่านเดิมถูกต้องหรือไม่
    const isMatch = await bcrypt.compare(oldPassword, doctorInfo.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ไม่เหมือนกับรหัสผ่านเก่า
    const isSamePassword = await bcrypt.compare(newPassword, doctorInfo.password);
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


router.post('/doctorUpdate', async (req, res) => {
  let conn = null;
  const { doc_id, doc_name, phone } = req.body;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่า `doc_id`, `doc_name`, และ `phone` ถูกส่งมาครบถ้วน
    if (!doc_id || !doc_name || !phone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน (doc_id, doc_name, phone)",
      });
    }

    // เริ่มต้น Transaction
    await conn.beginTransaction();

    // อัปเดตข้อมูลในตาราง `doctor`
    const [doctorResult] = await conn.query(
      "UPDATE doctor SET doc_name = ?, phone = ? WHERE doc_id = ?",
      [doc_name, phone, doc_id]
    );

    // อัปเดตข้อมูลในตาราง `Appointment`
    const [appointmentResult] = await conn.query(
      "UPDATE appointments SET doc_name = ? WHERE doc_id = ?",
      [doc_name, doc_id]
    );

    // ตรวจสอบว่ามีการอัปเดตข้อมูลในทั้งสองตารางหรือไม่
    if (doctorResult.affectedRows > 0) {
      await conn.commit();
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      // Rollback หากไม่มีข้อมูลในตาราง `doctor`
      await conn.rollback();
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลแพทย์ในระบบ' });
    }
  } catch (error) {
    // Rollback ในกรณีที่เกิดข้อผิดพลาด
    if (conn) {
      await conn.rollback();
    }

    console.error('Error during doctor update:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: error.message,
    });
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    if (conn) {
      await conn.end();
    }
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

router.post('/doctorCount', async (req, res) => {
  let conn = null;

  try {
    conn = await initMySQL();

    const [doctorCountResult] = await conn.query("SELECT COUNT(*) AS doctorCount FROM doctor");

    const doctorCount = doctorCountResult[0]?.doctorCount || 0;

    res.json({
      doctorCount: doctorCount,
    });
  } catch (error) {
    console.error('Error retrieving doctor count:', error);
    res.status(500).json({ message: 'Error retrieving doctor count', error: error.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

router.post('/doctorDelete', async (req, res) => {
  let conn = null;
  const { doc_id } = req.body;

  try {
    conn = await initMySQL();

    // ตรวจสอบว่ามี doc_id หรือไม่
    if (!doc_id) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก doc_id เพื่อทำการลบข้อมูล"
      });
    }
    await conn.beginTransaction();
    // คำสั่ง SQL สำหรับลบข้อมูลแพทย์
    const [result] = await conn.query(
      "DELETE FROM doctor WHERE doc_id = ?",
      [doc_id]
    );

    const [loginResult] = await conn.query(
      "DELETE FROM login WHERE login_id = ?",
      [doc_id]
    );

    // ตรวจสอบผลลัพธ์จากการลบ
    if (result.affectedRows > 0 || loginResult.affectedRows > 0) {
      await conn.commit();
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลแพทย์สำเร็จ'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลแพทย์ที่ต้องการลบ'
      });
    }
  } catch (error) {
    console.error('Error during doctor delete:', error.message);
    console.error('Stack trace:', error.stack);
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
router.post('/doctorinfo', verifyToken, async (req, res) => {
  let conn;

  try {

    const login_id = req.user?.login_id;


    if (!login_id) {
      return res.status(400).json({ message: 'Invalid or missing login ID' });
    }

    conn = await initMySQL();


    const [doctorResults] = await conn.query(
      'SELECT * FROM doctor WHERE doc_id = ?',
      [login_id]
    );


    if (doctorResults.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorInfo = doctorResults[0];

    res.status(200).json({
      message: 'doctor data retrieved successfully',
      doctor: doctorInfo,
    });
  } catch (error) {

    console.error('Error retrieving doctor data:', error);

    res.status(500).json({
      message: 'Error retrieving doctor data',
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


router.post("/add-availability", async (req, res) => {
  let conn;
  const { doc_id, available_date, start_time, end_time } = req.body;

  if (!doc_id || !available_date || !start_time || !end_time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    console.log("Request Payload:", { doc_id, available_date, start_time, end_time });

    conn = await initMySQL();

    // ✅ Generate Unique Availability ID
    const Availability_id = `Avail-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const query = `
        INSERT INTO doctor_availability 
        (Availability_id, doc_id, available_date, start_time, end_time) 
        VALUES (?, ?, ?, ?, ?)
      `;
    await conn.query(query, [Availability_id, doc_id, available_date, start_time, end_time]);

    res.json({ message: "Availability added successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Failed to add availability", error: error.message });
  } finally {
    if (conn) await conn.end();
  }
});

// ดึงวันว่าง
router.post("/get-availability", async (req, res) => {
  const { doc_id } = req.body; // รับ doc_id ผ่าน body
  let conn;
  try {
    conn = await initMySQL();
    const [availability] = await conn.query(
      "SELECT Availability_id, available_date, start_time, end_time FROM doctor_availability WHERE doc_id = ?",
      [doc_id]
    );
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch availability", error: error.message });
  }
});


router.post("/delete-availability", async (req, res) => {
  const { Availability_id } = req.body;

  // ตรวจสอบว่า Availability_id มีอยู่ในคำขอหรือไม่
  if (!Availability_id) {
    return res.status(400).json({ message: "Availability_id is required" });
  }

  let conn;
  try {
    // สร้างการเชื่อมต่อกับฐานข้อมูล
    conn = await initMySQL();

    // ลบข้อมูลจากตาราง doctor_availability
    const query = "DELETE FROM doctor_availability WHERE Availability_id = ?";
    const [result] = await conn.query(query, [Availability_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ message: "Failed to delete availability", error: error.message });
  } finally {
    if (conn) await conn.end(); // ปิดการเชื่อมต่อฐานข้อมูล
  }
});






router.post('/saveAvailability', verifyToken, async (req, res) => {
  let conn;
  try {
    const { Availability_id, date, time_start, time_end } = req.body;
    const doc_id = req.user.login_id; 
    if (!date || !time_start || !time_end) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    conn = await initMySQL();

    await conn.query(
      'INSERT INTO doctor_availability (Availability_id, doc_id, available_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [Availability_id, doc_id, date, time_start, time_end]  // เพิ่ม doc_id และแก้ค่าที่ส่งให้ตรงกัน
    );

    res.status(200).json({
      success: true,
      message: 'Availability saved successfully',
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({
      message: 'Error saving availability',
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




router.post('/getAvailabilitydoctor', verifyToken, async (req, res) => {
  let conn;
  try {
    const login_id = req.user?.login_id;

    if (!login_id) {
      return res.status(400).json({ message: 'Invalid or missing login ID' });
    }

    conn = await initMySQL();

    const [availabilityResults] = await conn.query(
      'SELECT * FROM doctor_availability WHERE doc_id = ?',
      [login_id]
    );

    // ตรวจสอบว่า availabilityResults เป็น null หรือไม่มีข้อมูล
    if (!availabilityResults || availabilityResults.length === 0) {
      return res.status(404).json({ message: 'ยังไม่มีข้อมูล' });  // ส่งข้อความ "ยังไม่มีข้อมูล"
    }

    res.status(200).json({
      message: 'Availability data retrieved successfully',
      availability: availabilityResults, // ส่งข้อมูล availabilityResults
    });
  } catch (error) {
    console.error('Error retrieving availability data:', error);
    res.status(500).json({
      message: 'Error retrieving availability data',
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

router.post('/doctorappointments', verifyToken, async (req, res) => {
  let conn;
  try {
    const login_id = req.user?.login_id; 

    if (!login_id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    conn = await initMySQL();

    const [appointmentsResults] = await conn.query(
      `SELECT a.*, u.user_fname, u.user_lname, u.nickname, u.faculty, u.phone
       FROM appointments a 
       JOIN users u ON a.user_id = u.user_id
       WHERE a.doc_id = ? AND a.status = 'ยืนยัน'`,
      [login_id]
    );

    if (!appointmentsResults || appointmentsResults.length === 0) {
      return res.status(404).json({ message: "ยังไม่มีข้อมูล" });
    }

    res.status(200).json({
      message: "Appointments retrieved successfully",
      appointments: appointmentsResults,
    });

  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});





router.post('/getAvailabilitytime', async (req, res) => {
  let conn;
  try {
    const { doc_id } = req.body;
    if (!doc_id) {
      return res.status(400).json({ message: 'Invalid or missing doctor ID' });
    }

    conn = await initMySQL();

    const [availabilityResults] = await conn.query(
      'SELECT * FROM doctor_availability WHERE doc_id = ?',
      [doc_id]
    );

    if (!availabilityResults || availabilityResults.length === 0) {
      return res.status(404).json({ message: 'ยังไม่มีการเพิ่มวันที่ว่าง' });
    }

    res.status(200).json({
      message: 'Availability data retrieved successfully',
      availability: availabilityResults,
    });
  } catch (error) {
    console.error('Error retrieving availability data:', error);
    res.status(500).json({
      message: 'Error retrieving availability data',
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





router.delete('/deleteAvailability', async (req, res) => {
  let conn;

  try {
    const { Availability_id } = req.body;

    if (!Availability_id) {
      return res.status(400).json({ message: 'Availability ID is required' });
    }

    conn = await initMySQL();

    // ลบข้อมูลจากฐานข้อมูลตาม Availability_id
    const [deleteResult] = await conn.query(
      'DELETE FROM doctor_availability WHERE Availability_id = ?',
      [Availability_id]
    );

    // ตรวจสอบว่าแถวที่ลบถูกค้นพบหรือไม่
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({
      message: 'Error deleting availability',
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

router.post('/saveSymptoms', async (req, res) => {
  let conn;
  try {
    const { user_id, appointment_id, symptoms, additionalSymptom } = req.body;

    if (!user_id || !appointment_id || !symptoms) {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    conn = await initMySQL();

    let allSymptoms = Array.isArray(symptoms) ? [...symptoms] : [];


    if (additionalSymptom && additionalSymptom.trim() !== '') {
        allSymptoms.push(additionalSymptom.trim());
    }

    await conn.query(
        "UPDATE appointments SET symptoms = ? WHERE Appointment_id  = ?",
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







module.exports = router;
