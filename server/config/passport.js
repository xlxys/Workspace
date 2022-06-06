const passport        = require('passport')
const LocalStrategy   = require('passport-local').Strategy
const User            = require('../models').User
const bcrypt          = require('bcryptjs')


passport.use(
  new LocalStrategy( 
    {
      usernameField: 'email',
    },
    function(email, password, done) {
      User.findOne({
        where: {
          email: email
        }
      })
        .then(user => {
          if (!user) {
            return done(null, false, { message: "wrong email or password" })
          } else {
            bcrypt.compare(password, user.password, (err, validPassword) => {
              if (err) throw err;
              if (validPassword) {
                return done(null, user);
              } else {
                return done(null, false, { message: "wrong email or password" })
              }
            })
          }
        })
        .catch(err => {
          return done(null, false, {
            message: err
          });
        })
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
    where: {
      id: id
    }
  })
    .then(user => {
      done(null, user)
    })
    .catch(err => console.log(err))
});