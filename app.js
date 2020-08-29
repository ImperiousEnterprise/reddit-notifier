var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const { REDDIT_CLIENT_ID } = process.env;
const {getRedditToken}  = require('./lib/reddit');
const {Token} = require('./models/token');
//Connect to db
const mongodb = require('./lib/inmemorydb');
( async() => {await mongodb.connect()})();

//get reddit token
(async() => {
    let token = await getRedditToken(REDDIT_CLIENT_ID);
    let t = new Token({token: token});
    await t.save();
})();

//Start refresh job and mail job
const { reddit_refresh_token,get_top_posts,send_top_posts } = require('./lib/jobs');
reddit_refresh_token.start();
get_top_posts.start();
send_top_posts.start();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

module.exports = app;
