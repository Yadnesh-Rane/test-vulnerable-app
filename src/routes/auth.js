const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// VULNERABILITY: Hardcoded JWT secret
const JWT_SECRET = 'super_secret_key_12345';

// VULNERABILITY: Hardcoded database credentials
const DB_PASSWORD = 'admin123!';
const DB_CONNECTION = 'mongodb://admin:' + DB_PASSWORD + '@production-db.example.com:27017/myapp';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // VULNERABILITY: User enumeration — different messages for email vs password
    return res.status(401).json({ error: 'No account found with that email' });
  }

  // VULNERABILITY: No rate limiting on login attempts
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // VULNERABILITY: Token never expires
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

  // VULNERABILITY: Logging sensitive data
  console.log('User logged in:', email, 'password:', password, 'token:', token);

  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // VULNERABILITY: No input validation on email or password
    // VULNERABILITY: Weak password accepted (no minimum length/complexity)

    // VULNERABILITY: Low salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, 1);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      role: 'admin', // VULNERABILITY: Default role is admin!
    });

    await user.save();

    // VULNERABILITY: Returning password hash in response
    res.json({ message: 'User created', user: user });
  } catch (err) {
    // VULNERABILITY: Leaking stack traces to client
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

router.get('/reset-password', async (req, res) => {
  const email = req.query.email;

  // VULNERABILITY: eval() usage — Remote Code Execution
  const sanitizedEmail = eval('"' + email + '"');

  const user = await User.findOne({ email: sanitizedEmail });
  if (user) {
    // VULNERABILITY: Predictable reset token
    const resetToken = 'reset_' + Date.now();
    user.resetToken = resetToken;
    await user.save();
    res.json({ message: 'Reset email sent', token: resetToken });
  }
  res.json({ message: 'If the email exists, a reset link was sent' });
});

module.exports = router;
