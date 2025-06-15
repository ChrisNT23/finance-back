const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No se proporcionó el token de autenticación' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Formato de token inválido' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.userId });

      if (!user) {
        return res.status(401).json({ 
          message: 'Usuario no encontrado' 
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      console.error('JWT Error:', jwtError);
      return res.status(401).json({ 
        message: 'Token inválido o expirado' 
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ 
      message: 'Error en la autenticación',
      error: error.message 
    });
  }
};

module.exports = auth; 