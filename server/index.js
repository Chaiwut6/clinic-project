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
  const { user_id, password, user_fname, user_lname, nickname, year, phone, faculty, status } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userData = {
    user_id, 
    password : passwordHash, 
    user_fname, 
    user_lname, 
    nickname, 
    year, 
    phone, 
    faculty,
    status:"user"
  };

  const [results] = await conn.query('INSERT INTO users SET ?', userData);
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
  const doctorData = {
    doc_id, 
    password : passwordHash, 
    doc_name, 
    status:'doctor' 
  };

  const [results] = await conn.query('INSERT INTO doctor SET ?', doctorData);
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

app.post('/api/register-employee', async (req, res) => {
  try {
  const { employee_id, password, status} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const employeeData = {
    employee_id, 
    password : passwordHash,  
    status:'employee' 
  };
  const [results] = await conn.query('INSERT INTO employee SET ?', employeeData);
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
    password : passwordHash,  
    status:'manager' 
  };
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


app.post("/api/login-user", async (req, res) => {
  try {
    const { user_id, password } = req.body;
    const [results] = await conn.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
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


    const token = jwt.sign({ user_id }, secret, { expiresIn: '1h' });

    res.json({
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
    const doctorData = results[0];
    if (!doctorData) {
      return res.status(400).json({
        message: 'Login failed (wrong userid)'
      });
    }
    const match = await bcrypt.compare(password, doctorData.password);
    if (!match) {
      return res.status(400).json({
        message: 'Login failed (wrong password)'
      });
    }

 
    const token = jwt.sign({ doc_id }, secret, { expiresIn: '1h' });

    res.json({
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

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`);
});

