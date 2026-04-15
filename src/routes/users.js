const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fs = require('fs');

// VULNERABILITY: No authentication middleware — anyone can access user data

router.get('/:id', async (req, res) => {
  // VULNERABILITY: IDOR — no check that the requesting user owns this resource
  const user = await User.findById(req.params.id);

  // VULNERABILITY: Returning all fields including password hash
  res.json(user);
});

router.put('/:id', async (req, res) => {
  // VULNERABILITY: Mass assignment — user can set any field including role
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  // VULNERABILITY: No authorization check — any user can delete any account
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

router.get('/:id/profile-pic', async (req, res) => {
  // VULNERABILITY: Path traversal
  const filename = req.query.file;
  const filePath = './uploads/' + filename;

  // VULNERABILITY: No path sanitization
  const data = fs.readFileSync(filePath);
  res.send(data);
});

router.post('/search', async (req, res) => {
  // VULNERABILITY: NoSQL injection via $where
  const query = req.body.query;
  const users = await User.find({ $where: 'this.name.includes("' + query + '")' });
  res.json(users);
});

// VULNERABILITY: Debug endpoint left in production code
router.get('/debug/all', async (req, res) => {
  console.log('DEBUG: Fetching all users');
  const users = await User.find({});
  res.json(users);
});

// TODO: Add pagination
// FIXME: This endpoint is way too slow on large datasets
router.get('/', async (req, res) => {
  // VULNERABILITY: No pagination — fetches ALL users (memory bomb)
  var users = await User.find({});
  var result = [];
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    // VULNERABILITY: N+1 query pattern
    var posts = await Post.find({ author: u._id });
    result.push({ ...u.toObject(), postCount: posts.length });
  }
  res.json(result);
});

module.exports = router;
