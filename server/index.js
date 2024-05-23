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

const app = express()
app.use(express.json())
app.use(cors({
  credentials: true,
  origin: ['http://localhost:8888']
}))
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
  const { user_id, password, user_fname, user_lname, nickname, year, phone, faculty, role} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userData = {
    user_id, 
    user_fname, 
    user_lname, 
    nickname, 
    year, 
    phone, 
    faculty,
    roles: 'user',

  };
  const loginData = {
    login_id: user_id, 
    password: passwordHash,
    roles: 'user' 
  };


  const [results] = await conn.query('INSERT INTO users SET ?', userData);
  const [resultslogin] = await conn.query('INSERT INTO login SET ?', loginData);
 
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

app.post('/api/register-doctor', async (req, res) => {
  try {
  const { doc_id, password, doc_name, status} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const loginData = {
    login_id: doc_id, 
    password: passwordHash,
    roles: 'doctor' 
  };

  const doctorData = {
    doc_id, 
    doc_name, 
    roles:'doctor' 
  };

  const [results] = await conn.query('INSERT INTO doctor SET ?', doctorData);
  const [resultslogin] = await conn.query('INSERT INTO login SET ?', loginData);
  res.json({
    message: 'insert OK',
    results,
    resultslogin
  });   
  } catch (error) {
    console.log('error', error)
    res.json({
      message: 'insert error',
      error: error.message
    })
  }
});

app.post('/api/register-employee', async (req, res) => {
  try {
  const { employee_id, password, status} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const employeeData = {
    employee_id, 
    roles:'employee' 
  };
  const loginData = {
    login_id: employee_id, 
    password: passwordHash,
    roles:'employee'  
  };
  const [results] = await conn.query('INSERT INTO employee SET ?', employeeData);
  const [resultslogin] = await conn.query('INSERT INTO login SET ?', loginData);
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
    const [results] = await conn.query("SELECT * FROM login WHERE login_id = ?", [login_id]);
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

    const token = jwt.sign({ login_id }, secret, { expiresIn: '1h' });
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

app.get('/api/users', async (req, res) => {
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







app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`);
});
