const cors = require('cors')
const bodyParser = require('body-parser');
const http = require('http')
const express = require('express')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
// const session = require('express-session')
const bcrypt = require('bcryptjs')
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express()
app.use(express.json())
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:8888']
}))

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });
    req.user = decoded;
    next();
  });
};

// app.use(cookieParser())

// app.use(session({
//   secret: 'secret',
//   resave: false,
//   saveUninitialized: true
// }))
const port = 8000
const secret = 'mysecret'

let conn = null

const initMySQL = async () => {
  try {
    conn = await mysql.createConnection({
      host: 'db',
      user: 'root',
      password: 'root',
      database: 'clinic'
    });
    console.log('MySQL connected successfully');
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
};

app.use(async (req, res, next) => {
  try {
    await initMySQL();
    next();
  } catch (error) {
    console.error('Error initializing MySQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use(bodyParser.json());

app.post('/api/register-user', async (req, res) => {
  try {
    const { user_id, password, user_fname, user_lname, nickname, year, phone, faculty, role } = req.body;

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare the user data and login data for insertion
    const userData = {
      user_id,
      user_fname,
      user_lname,
      nickname,
      year,
      phone,
      faculty,
      roles: 'user', // Default role is 'user'
    };

    const loginData = {
      login_id: user_id,
      password: passwordHash,
      roles: 'user', // Default role is 'user'
    };

    // Insert user data into the users table
    const [userResults] = await conn.query('INSERT INTO users SET ?', userData);

    // Insert login data into the login table
    const [loginResults] = await conn.query('INSERT INTO login SET ?', loginData);

    // Create a JWT token for the new user (login_id as payload)
    const token = jwt.sign({ login_id: user_id }, secret, { expiresIn: '1h' });

    // Set the token in a cookie for the user (httpOnly for security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'Strict', 
      
    });

    // Respond with success message and include token in the response
    res.json({
      message: 'User registered successfully',
      user_id,
      token, // Send the token in the response
    });

  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
});


app.post('/api/register-doctor', async (req, res) => {
  try {
    // รับข้อมูลจาก body ของคำขอ
    const { doc_id, /* password, */ doc_name, phone, status } = req.body;

    // // เข้ารหัสรหัสผ่าน (ปิดการใช้งานตอนนี้)
    // const passwordHash = await bcrypt.hash(password, 10);

    // สร้างข้อมูลที่จะใช้สำหรับการบันทึกในตาราง login
    const loginData = {
      login_id: doc_id, 
      // password: passwordHash, // ปิดการใช้งานรหัสผ่าน
      roles: 'doctor' 
    };

    // สร้างข้อมูลที่จะใช้สำหรับการบันทึกในตาราง doctor
    const doctorData = {
      doc_id, 
      doc_name,
      phone,
      roles: 'doctor'
    };

    // ใช้ transaction ในการบันทึกข้อมูลทั้งสองตาราง
    await conn.beginTransaction();

    // บันทึกข้อมูลในตาราง doctor
    const [doctorResults] = await conn.query('INSERT INTO doctor SET ?', doctorData);

    // บันทึกข้อมูลในตาราง login
    // const [loginResults] = await conn.query('INSERT INTO login SET ?', loginData);

    // ยืนยันการทำ transaction
    await conn.commit();

    // สร้าง JWT token
    const token = jwt.sign({ login_id: doc_id }, secret, { expiresIn: '1h' });

    // ตั้งค่า cookie สำหรับ token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 ชั่วโมง
      sameSite: 'Strict',
    });

    // ส่ง response กลับไปยัง client พร้อม token
    res.json({
      message: 'Doctor registration successful',
      doctorResults,
      // loginResults,
      token, // ส่ง token ใน response
    });

  } catch (error) {
    // ยกเลิก transaction ในกรณีเกิดข้อผิดพลาด
    await conn.rollback();
    console.error('Error during doctor registration:', error);

    // ส่ง response ข้อผิดพลาดกลับไปยัง client
    res.status(500).json({
      message: 'Doctor registration failed',
      error: error.message
    });
  }
});



app.post('/api/register-employee', async (req, res) => {
  try {
    const { employee_id, password, status } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const employeeData = {
      employee_id,
      roles: 'employee', // Default role is 'employee'
    };

    const loginData = {
      login_id: employee_id,
      password: passwordHash,
      roles: 'employee', // Default role is 'employee'
    };

    // Insert employee data into the employee table
    const [employeeResults] = await conn.query('INSERT INTO employee SET ?', employeeData);

    // Insert login data into the login table
    const [loginResults] = await conn.query('INSERT INTO login SET ?', loginData);

    // Create a JWT token for the new employee (login_id as payload)
    const token = jwt.sign({ login_id: employee_id }, secret, { expiresIn: '1h' });

    // Set the token in a cookie for the employee (httpOnly for security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'Strict',
    });

    // Respond with success message and include token in the response
    res.json({
      message: 'Employee registered successfully',
      employee_id,
      token, // Send the token in the response
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
});

app.post('/api/register-manager', async (req, res) => {
  try {
  const { man_id, password, status} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const managerData = {
    man_id,  
    roles:'manager'  
  };
  const loginData = {
    login_id: man_id, 
    password: passwordHash,
    roles:'manager'  
  };
  const [resultslogin] = await conn.query('INSERT INTO login SET ?', loginData);
  const [results] = await conn.query('INSERT INTO manager SET ?', managerData);
  res.json({
    message: 'insert OK',
    results
  });   
  } catch (error) {
    console.log('error', error)
    res.json({
      message: 'insert error',
      error: error.message
    })
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { login_id, password } = req.body;

    // ดึงข้อมูลจากตาราง login
    const [loginResults] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    const userData = loginResults[0];

    if (!userData) {
      return res.status(400).json({ message: 'Login failed (invalid user ID)' });
    }

    // ตรวจสอบรหัสผ่าน
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(400).json({ message: 'Login failed (invalid password)' });
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
      userInfo = employeeResults[0]; // สำหรับ employee
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
      message: 'Login successful',
      user: userData,
      userInfo,
      Assess: userAssess,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});




app.post("/api/login-doctor", async (req, res) => {
  try {
    const { doc_id, password } = req.body;
    const [results] = await conn.query("SELECT * FROM doctor WHERE doc_id = ?", [doc_id]);
    const userData = results[0];
    if (!userData) {
      return res.status(400).json({
        message: 'Login failed (wrong userid)'
      });
    }
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(400).json({
        message: 'Login failed (wrong password)'
      });
    }

    const token = jwt.sign({ doc_id , role:'doctor' }, secret, { expiresIn: '1h' });
    const roles = userData.roles;
    res.json({
      roles,
      message: 'Login success',
      token
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(401).json({
      message: 'Login failed',
      error
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    let authToken = ''
    if(authHeader){
      authToken = authHeader.split(' ')[1]
    }
    console.log('authToken',authToken)

    const user = jwt.verify(authToken,secret)
    const [checkResults] = await conn.query('SELECT * FROM users where user_id = ?' , user.user_id)
    if(!checkResults[0]){
      throw{message: 'user not found'}
    }
    const [results] = await conn.query('SELECT * FROM users')
    res.json({
    users: results
  })
  } catch (error) {
    console.log('error',error)
    res.status(403).json({
      message: 'authentication fail',
      error
    })
  }
})

// เพิ่มสำหรับบันทึกผลลัพธ์
app.post('/api/save-result', async (req, res) => {
  try {
    const { user_id, totalScore, result, user_fname, user_lname } = req.body;


    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

 
    const userData = {
      user_id: user_id,
      total_score: totalScore,
      result: result,
      user_fname: user_fname,
      user_lname: user_lname
    };

    // Insert data into the database
    const [results] = await conn.query('INSERT INTO results SET ?', userData);

    res.json({
      message: 'Result saved successfully',
      results
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({
      message: 'Error saving result',
      error: error.message
    });
  }
});

app.post('/api/userinfo', verifyToken, async (req, res) => {
  const login_id = req.user.login_id;

  try {
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
    res.status(500).json({ message: 'Error retrieving user data' });
  }
});

app.post('/api/employeeinfo', verifyToken, async (req, res) => {
  const login_id = req.user.login_id; // ใช้ login_id จาก Token ที่ถูกยืนยัน

  try {
    // ดึงข้อมูล employee จากตาราง employee โดยใช้ login_id
    const [employeeResults] = await conn.query("SELECT * FROM employee WHERE employee_id = ?", [login_id]);


    const employeeInfo = employeeResults[0];  // ข้อมูลของ employee
    

    // หากไม่พบข้อมูล employee
    if (!employeeInfo) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // ส่งข้อมูล employee และการประเมินผลกลับ
    res.json({
      employee: employeeInfo,
    });
  } catch (error) {
    // ถ้ามีข้อผิดพลาดในการดึงข้อมูล
    res.status(500).json({ message: 'Error retrieving employee data', error: error.message });
  }
});




app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
});

app.post('/api/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const login_id = req.user.login_id;  // ใช้ login_id จากข้อมูลใน token

  // ตรวจสอบว่า newPassword และ confirmPassword ตรงกันหรือไม่
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
  }

  try {
    // ค้นหาผู้ใช้จาก login_id ในฐานข้อมูล
    const [userLogin] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
    
    // หากไม่พบผู้ใช้
    if (!userLogin || userLogin.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const userInfo = userLogin[0];

    // ตรวจสอบรหัสผ่านเดิม
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
  }
});

app.post('/api/updateuser', verifyToken, async (req, res) => {
  const login_id = req.user.login_id;
  const {
    user_id, user_fname, user_lname, nickname, faculty, year, phone
  } = req.body;

  try {
    // Check for missing required fields
    if (!user_id || !user_fname || !user_lname || !faculty || !year || !nickname || !phone) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Run the SQL query
    const [result] = await conn.query(
      "UPDATE users SET user_id = ?, user_fname = ?, user_lname = ?, nickname = ?, faculty = ?, year = ?, phone = ? WHERE user_id = ?",
      [user_id, user_fname, user_lname, nickname, faculty, year, phone, login_id]
    );

    // Check if any rows were updated
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
    } else {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }
  } catch (error) {
    // Log detailed error information
    console.error('Error during user update:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  }
});




app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`);
});