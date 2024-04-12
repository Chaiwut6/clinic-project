const express = require('express')
const mysql = require('mysql2/promise')

const app = express()
const port = 8000

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'db', 
    user: 'root',
    password: 'root',
    database: 'clinic'
  })
}

app.get('/users', async (req, res) => {
  await initMySQL()
  const [results] = await conn.query('SELECT * FROM users')
  res.json(results)
})

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}/`)
})