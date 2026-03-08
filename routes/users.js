const express = require('express');
const router = express.Router();

// lay danh sach users
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/home', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;
