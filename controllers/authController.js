const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Por favor proporciona email y contraseña'
      });
    }

    console.log('Intentando iniciar sesión con email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    console.log('Usuario encontrado:', user.email);

    // Check password using the model's method
    const isMatch = await user.comparePassword(password);
    console.log('¿Contraseña coincide?:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generado exitosamente para:', user.email);

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Por favor proporciona todos los campos requeridos'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Create user (password will be hashed by the pre-save hook)
    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    console.log('Usuario registrado exitosamente:', email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
}; 