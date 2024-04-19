// const cors = require('cors')
const bodyParser = require('body-parser');
const http = require('http')
const express = require('express')
const mysql = require('mysql2/promise')
// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
// const session = require('express-session')
const bcrypt = require('bcryptjs')


const app = express()
// app.use(express.json())
// app.use(cors({
//   credentials: true,
//   origin: ['http://localhost:8888']
// }))
// app.use(cookieParser())

// app.use(session({
//   secret: 'secret',
//   resave: false,
//   saveUninitialized: true
// }))
const port = 8000
// const secret = 'mysecret'


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

app.post('/api/register', async (req, res) => {
  try {
  const { user_id, password, user_fname, user_lname, nickname, year, phone, faculty } = req.body;
  const passwordHash = await bcrypt.hash(password, 10)
  const userData = {
    user_id, 
    password : passwordHash, 
    user_fname, 
    user_lname, 
    nickname, 
    year, 
    phone, 
    faculty
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
      error
    })
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { user_id, password} = req.body;
    const [results] = await conn.query("SELECT * from users WHERE user_id = ?", user_id);
    const userData = results[0]
    res.json({
      userData
    })
  } catch (error) {
    console.log('error',error)
    res.status(401).json({
      message: 'login fail',
      error
    })
  }
})

app.get('/users', async (req, res) => {
  const [results] = await conn.query('SELECT * FROM users')
  res.json(results)
})

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`);
});
