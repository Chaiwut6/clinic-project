const jwt = require('jsonwebtoken');
const secret = 'mysecret'; 

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Token not found.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden. Token invalid.' });
      }

      req.user = decoded;
      next();  
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
