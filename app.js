const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
//var logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const PORT = 8080;
const app = express();
// App server
const server =  app.listen(PORT, () =>
         console.log('Listing on port '+ PORT)
    );
const io = socket(server)
global.io = io;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


io.on("connection", (socket) => {
   console.log("Soket ready: ", socket.id)
   socket.on('join', function(room) {
        console.log(room)
        socket.join(room);
    });
});
module.exports = app;
