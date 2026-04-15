// VULNERABILITY: Using Math.random() for security-sensitive operations
function generateToken(length) {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
}

// VULNERABILITY: Blocking the event loop with synchronous heavy computation
function hashPasswordSync(password) {
  const crypto = require('crypto');
  let hash = password;
  for (let i = 0; i < 1000000; i++) {
    hash = crypto.createHash('md5').update(hash).digest('hex');
  }
  return hash;
}

// VULNERABILITY: Regex DoS (ReDoS)
function validateEmail(email) {
  const re = /^([a-zA-Z0-9]+[-._+&])*[a-zA-Z0-9]+@([-a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/;
  return re.test(email);
}

// VULNERABILITY: XSS — no sanitization of user content
function renderUserProfile(user) {
  return `
    <div class="profile">
      <h1>${user.name}</h1>
      <p>${user.bio}</p>
      <div>${user.website}</div>
    </div>
  `;
}

// Magic numbers everywhere
function calculateDiscount(price, type) {
  if (type === 1) return price * 0.15;
  if (type === 2) return price * 0.25;
  if (type === 3) return price * 0.40;
  if (price > 100) return price * 0.05;
  return 0;
}

// VULNERABILITY: Prototype pollution
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = target[key] || {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = { generateToken, hashPasswordSync, validateEmail, renderUserProfile, calculateDiscount, merge };
