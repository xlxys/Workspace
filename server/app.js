// .env file
require('dotenv').config();

const express           = require('express')
const app               = express()
const http              = require('http')
const server            = http.createServer(app)
const Sequelize         = require('./models/index').sequelize
const db                = require('./models')

const passport          = require('passport')
const session           = require('express-session')
const SessionStore      = require('connect-session-sequelize')(session.Store)

const adminRouter       = require('./Routes/admin')



// incude passport
require("./config/passport");

const sessionStore = new SessionStore({
    db: Sequelize,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 7 * 24 * 60 * 60 * 1000
  })

//configure session 
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    maxAge : 10000 * 60 * 60 * 24 
          }
}));

sessionStore.sync()


// add passport
app.use(passport.initialize());
app.use(passport.session());


const flash             = require('connect-flash')
app.use(flash());

// // add middleware for flash messages
// app.use((req, res, next) => {
//   res.locals.successMessage = req.flash("successMessage");
//   res.locals.errorMessage = req.flash("errorMessage");
//   res.locals.error = req.flash("error");
  
//   if (req.user) {
//     res.locals.user = req.user;
//   }
//   next();
// });


//body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


//ejs
const layouts           = require('express-ejs-layouts')
app.use(layouts);
app.set('layout', './layouts/layout')
app.set('view engine', 'ejs')

//static files
app.use(express.static('/public'));

app.use('/css',express.static(__dirname + '/public/css'))
app.use('/js',express.static(__dirname + '/public/js'))
app.use('/img',express.static(__dirname + '/public/img'))


//Routes
app.use('/', require('./Routes/index'))
app.use('/', require('./Routes/auth')) 
app.use('/admin', adminRouter)


// dataBase
db.sequelize
.sync()
.then(() => {
    const PORT = process.env.PORT || 3000
    server.listen(PORT, console.log(`Server running at http://localhost:${PORT}/`))
})
.catch((err) => {
    console.log(`error connecting : ${err.message}`)
});





