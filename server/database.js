const mysql = require('mysql2/promise');

const initMySQL = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'db',
      user: 'root',
      password: 'root',
      database: 'clinic',
    });
    console.log('MySQL connected successfully');
    return connection;
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    throw error;
  }
};

module.exports = initMySQL;
