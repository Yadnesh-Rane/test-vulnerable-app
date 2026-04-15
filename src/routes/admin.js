const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const User = require('../models/User');

// VULNERABILITY: No authentication or authorization on admin routes!

router.post('/execute', (req, res) => {
  // VULNERABILITY: CRITICAL — Remote Command Execution
  const command = req.body.command;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout, errors: stderr });
  });
});

router.post('/eval', (req, res) => {
  // VULNERABILITY: CRITICAL — eval() on user input
  try {
    const code = req.body.code;
    const result = eval(code);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/config', (req, res) => {
  // VULNERABILITY: Exposing environment variables and secrets
  res.json({
    env: process.env,
    dbPassword: 'admin123!',
    jwtSecret: 'super_secret_key_12345',
    apiKeys: {
      stripe: 'sk_live_abc123xyz',
      sendgrid: 'SG.xxxxxxxxxxxxx',
      aws: 'AKIAIOSFODNN7EXAMPLE',
    },
  });
});

router.post('/users/bulk-delete', async (req, res) => {
  // VULNERABILITY: Destructive operation with no confirmation or soft delete
  const { userIds } = req.body;
  await User.deleteMany({ _id: { $in: userIds } });
  res.json({ message: `Deleted ${userIds.length} users` });
});

// VULNERABILITY: Overly broad CORS for admin routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

module.exports = router;
