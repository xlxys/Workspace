const express = require('express');
const router = express.Router();

const passport = require('passport');
const bcrypt = require('bcryptjs');

const { isLoggedout, isAuthenticated } = require('../config/middleware')

const User = require('../models').User

//--------------------------------------------login
router.get('/login', isLoggedout, (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}));


//--------------------------------------------register
router.get('/register', isLoggedout, (req, res) => {
  res.render('register', { msg: "" });
});

router.post('/register', (req, res) => {
  const { first_name, last_name, email, password, password_repeat, managerApply } = req.body

  console.log(req.body)

  // validation
  if (!first_name || !last_name || !email || !password || !password_repeat) {
    res.render('register', { msg: "please enter all feilds" })
    return
  }
  if (password !== password_repeat) {
    res.render('register', { msg: "passwords does not match" })
    return
  }
  if (password.length < 3) {
    res.render('register', { msg: "password too short" })
    return
  }

  var apply = 0;

  if (managerApply == "apply") {
    apply = 1;
  }


  // check if user exist 
  User.findOne({
    where: {
      email: email
    }
  })
    .then((user) => {
      if (user) {
        res.render("register", { msg: "user already registered" })
        return
      } else {
        //create user

        //hash password
        var passwordhashed

        bcrypt.hash(password, 10, (err, hash) => {
          if (err) throw err
          passwordhashed = hash

          const newUser = new User({
            firstName: first_name,
            lastName: last_name,
            password: passwordhashed,
            email: email,
            status: "BASIC",
            managerApp: apply,
          })


          newUser.save()
            .then((user) => {
              console.log('user created successfully')
              req.flash("successM essage", "your account has been created successfully")
              res.redirect("/login")
            })
            .catch((err) => {
              console.log(err)
              req.flash("errorMessage", "there was an error creating")
              res.redirect("/register")
            })
        })
      }
    })
    .catch(err => {
      console.log(err)
    })


});


//--------------------------------------------logout
router.get('/logout', isAuthenticated, function (req, res) {

  req.session.destroy()
  req.logout()
  res.redirect('/login');
})




module.exports = router;