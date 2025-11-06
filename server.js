// server.js
require('dotenv').config(); // load .env first

// set up ======================================================================
// get all the tools we need
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// passport config ======================================================================
require('./config/passport')(passport);

// database connection ======================================================================
const dbURL = process.env.MONGO_URI || 'mongodb://localhost:27017/communityTradeDB';
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Great! MongoDB connected'))
.catch(err => console.log('Oh no! MongoDB connection error:', err));

// middleware ======================================================================
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
  { extended: true }
));

// sessions ======================================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'swap-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false 
  } // set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// static files & EJS ======================================================================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// user available in all templates ======================================================================
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// routes ======================================================================
require('./app/routes')(app, passport);

// start server ======================================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));


//Citations:
//Modified code from youtube tutorial: https://www.youtube.com/watch?v=z5UgtXOxEEk
//Reference code from https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial#setting-up-the-project
//Use of dotenv package to hide sensitive info: https://www.npmjs.com/package/dotenv
//Use of Learning Mode on AI tools to help with code structure,syntax and debugging  