const express = require('express');
const router = express.Router();

// trang chu
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/home', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
