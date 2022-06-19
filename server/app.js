// .env file
require('dotenv').config();

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const Sequelize = require('./models/index').sequelize
const db = require('./models')

const socket = require("socket.io")
const io = socket(server)

const passport = require('passport')
const session = require('express-session')
const SessionStore = require('connect-session-sequelize')(session.Store)





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
    maxAge: 10000 * 60 * 60 * 24
  }
}));

sessionStore.sync()


// add passport
app.use(passport.initialize());
app.use(passport.session());


const flash = require('connect-flash')
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



// var userLoged = {
//   first_name : req.user.firstName,
//   last_name : req.user.lastName,
//   email : req.user.email,
//   uuid : req.user.uuid
// }


// let users = [];
// io.on('connection', socket => {
//   socket.on("join server", (userLoged))
//     const user = {
//       firstName : userLoged.first_name,
//       lastName : userLoged.last_name,
//       email : userLoged.email,
//       uuid : userLoged.uuid,
//       socket : socket.id
//   }
//   push(user)
// })


//body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


//ejs
const layouts = require('express-ejs-layouts')
app.use(layouts);
app.set('layout', './layouts/layout')
app.set('view engine', 'ejs')

//static files
app.use(express.static('/public'));

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/img', express.static(__dirname + '/public/img'))


//Routes
app.use('/', require('./Routes/index'))
app.use('/', require('./Routes/auth'))
app.use('/', require('./Routes/users'))
app.use('/', require('./Routes/admin'))
app.use('/', require('./Routes/mod'))

// io.on('connection', socket => {
//   socket.on('join-Visio', (VisioID, userId) => {
//       console.log('Joined Room');
//       socket.join(VisioID);
//       // socket.to(roomId).broadcast.emit('user-connected');
//       socket.broadcast.to(VisioID).emit('user-connected', userId);

//       socket.on('message', message => {
//           io.to(VisioID).emit('createMessage', message);
//       })
//   })
// })


// let users = []

// io.on('connection', socket => {
//   socket.on("join meet", (meetUuid, userId) => {
//     const user = {
//       connectionId : socket.id, 
//       meet : meetUuid,
//       id : userId
//     }
//     users.push(user);
//     io.emit("users list", users)

//   });


//   socket.on("join room", (roomName, cb) => {
//       socket.join(roomName, cb)
//       cb(messages[roomName]);

//   });

//   socket.on("send message", ({ content, to, sender, chatName, isChannel })  => {
//       if (isChannel) {
//         const payload = {
//             content,
//             chatName,
//             sender,
//         }
//       socket.to(to).emit("new message", payload)
//       } else {
//         const payload = {
//           content,
//           chatName: sender,
//           sender,
//         }
//         socket.to(to).emit("new message", payload)
//       }


//       if (messages[chatName]) {
//         messages[chatName].push({
//           sender,
//           content,
//         })
//       }

//   });

//   socket.on("leave meet", (meetUuid, userId) => {
//     users = users.filter(user => user.connectionId !== socket.id)
//     io.emit("users list", users)
//   });

// });



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





