let express = require('express');
let mongoose = require('mongoose');
let createError = require('http-errors');
let logger = require('morgan');
let cookieParser = require('cookie-parser');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect(MONGO_URI);

mongoose.connection.on('connected', () => {
    console.log('Đã kết nối MongoDB thành công');
});

mongoose.connection.on('error', (err) => {
    console.error('Lỗi kết nối MongoDB:', err.message);
});

app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
