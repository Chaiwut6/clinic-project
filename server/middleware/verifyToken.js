const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET ;  // ควรใช้จาก .env

const verifyToken = (req, res, next) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Token not found.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden. Token invalid.' });
      }

      req.user = decoded;  // เพิ่ม user ลงใน req
      next();  
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
