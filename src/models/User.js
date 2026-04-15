const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // VULNERABILITY: No unique constraint — duplicate accounts possible
    // VULNERABILITY: No email format validation
  },
  password: {
    type: String,
    // VULNERABILITY: No minimum length requirement
  },
  name: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  resetToken: String,
  // VULNERABILITY: No timestamps — can't audit account activity
}, {
  // VULNERABILITY: toJSON doesn't strip password
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// VULNERABILITY: Password stored in plaintext if pre-save hook is bypassed
// No pre-save validation hook

module.exports = mongoose.model('User', userSchema);
