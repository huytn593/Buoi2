const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// cau hinh view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ket noi mongodb
mongoose.connect('mongodb+srv://admin:admin@musicbox.nlgmhuq.mongodb.net/?appName=Cluster0');
mongoose.connection.on('connected', () => {
  console.log("Ket noi MongoDB thanh cong!");
});

// dinh nghia routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

// xu ly loi 404
app.use((req, res, next) => {
  next(createError(404));
});

// xu ly loi chung
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ message: err.message });
});

module.exports = app;
