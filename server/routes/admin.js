//admin panel configuration

const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

// roles configuration
const { isAuthenticated, isAdmin } = require('../config/middleware')

//users database
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const User = require('../models').User
const Meet = require('../models').Meet

//--------------------------------get route for the admin panel interface (table application manager/stats)----------------
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {

  // -------------------------------count users
  User.count()
    .then((count) => {
      countUsers = count
    })
    .catch((err) => {
      console.log(err);
    });
  //---------------------------------count meets
  Meet.count()
    .then((count) => {
      countMeet = count
    })
    .catch((err) => {
      console.log(err);
    });

  //---------------------------------count meets monthly
  var nextMonth = new Date();
  var today = new Date();
  var dd = String(nextMonth.getDate()).padStart(2, '0');
  var mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
  var yyyy = nextMonth.getFullYear();
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  Meet.count({
    where: { [Op.and]: [{ meetDate: { [Op.lte]: nextMonth } }, { meetDate: { [Op.gte]: today } }] }
  })
    .then((count) => {
      countMeetMonth = count
    })
    .catch((err) => {
      console.log(err);
    });

  //---------------------------------count managers
  User.count({
    where: { status: "MANAGER" }
  })
    .then((count) => {
      countManagers = count
    })
    .catch((err) => {
      console.log(err);
    });

  //----------------------------------manager application table

  User.findAll({
    where: { managerApp: 1 },
    raw: true,
    order: [["createdAt", "DESC"]]
  })
    .then(users => {
      res.render('admin', { users, countUsers, countManagers, countMeet, countMeetMonth })
    })
    .catch((err) => {
      console.log(err);
    });

});

//--------------------------------review manager application
router.post('/managerapplication', isAuthenticated, isAdmin, (req, res) => {

  id = req.query.id;
  review = req.query.review;

  if (review == "accepted") {
    User.update(
      { status: "MANAGER", managerApp: 0 },
      { where: { id: id } }
    )
  }
  else {
    if (review == "rejected") {
      User.update(
        { managerApp: 0 },
        { where: { id: id } }
      )
        .then(() => {
          console.log('user updated successfully')
          req.flash("successMessage", "your account has been updated successfully")

        })
        .catch(err => {
          console.log(err)
          req.flash("errorMessage", "there was an error updating")
        })
    }
  }

  res.redirect("/admin")

});

//----------------------------------------find user for the search bar
router.post('/admin/users/search', isAuthenticated, isAdmin, (req, res) => {
  const { firstName, lastName, email, status } = req.body
  

  User.findAll(
    {
      where: {
        [Op.and]: [
          {
            firstName: { [Op.substring]: firstName }
          },
          {
            lastName: { [Op.substring]: lastName }
          },
          {
            email: { [Op.substring]: email }
          },
          {
            status: { [Op.substring]: status }
          },
        ]
      }
    }
  )
    .then((users) => {
      res.render('admin-user-table', { users: users })
    })
    .catch((err) => {
      console.log(err)
    }
    )
});


//----------------------------------------find user for the search bar
router.post('/admin/search', isAuthenticated, isAdmin, (req, res) => {
  const { firstName, lastName, email, status } = req.body
  

  User.findAll(
    {
      where: {
        [Op.and]: [
          {
            firstName: { [Op.substring]: firstName }
          },
          {
            lastName: { [Op.substring]: lastName }
          },
          {
            email: { [Op.substring]: email }
          },
          {
            status: { [Op.substring]: status }
          },
          { 
            managerApp: 1 
          }
        ]
      },

      order: [["createdAt", "DESC"]]
    }
  )
    .then((users) => {
      res.render('admin', { users: users })
    })
    .catch((err) => {
      console.log(err)
    }
    )
});


//---------------------------------------table of all the users-----------------------
router.get('/admin/users', isAuthenticated, isAdmin, (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.render('admin-user-table', { users: users })
    })
});


//----------------------------------------------adding user------------------------

//-----------get form for adding new users
router.get('/admin/users/new', isAuthenticated, isAdmin, (req, res, next) => {
  res.render('admin-new')
});

//----------post form for adding new users
router.post('/admin/users/new', isAuthenticated, isAdmin, (req, res) => {
  const { first_name, last_name, email, password, status } = req.body

  //validation
  if (!first_name || !last_name || !email || !password || !status) {
    res.render('admin-new', { msg: "please enter all feilds" })
    return
  }

  if (password.length < 3) {
    res.render('admin-new', { msg: "password too short" })
    return
  }

  // check if user exist 
  User.findOne({
    where: {
      email: email
    }
  })
    .then((user) => {
      if (user) {
        res.render("admin-new", { msg: "user already registered" })
        return
      }
      else {
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
            status: status
          })


          newUser.save()
            .then((user) => {
              req.flash("successMessage", "your account has been created successfully")
              res.redirect("/admin/users")
              

            })
            .catch((err) => {
              console.log(err)
              req.flash("errorMessage", "there was an error creating")

            })
        })
      }
    })
    .catch(err => {
      console.log(err)
    })

});


// ----------------------------------------------edit routes-----------------------
//----------get route
router.post('/admin/users/editForm/:id', isAuthenticated, isAdmin, (req, res) => {
  User.findOne(
    { where: { id: req.params.id } }
  )
    .then((user) => {
      res.render('admin-edit', { user })
    })

});


//-----------post route
router.post('/admin/users/edit/:id', (req, res) => {
  const { first_name, last_name, email, status } = req.body

  User.update(
    { firstName: first_name, lastName: last_name, email: email, status: status },
    { where: { id: req.params.id } }
  )
    .then(() => {
      console.log('user updated successfully')
      req.flash("successMessage", "your account has been updated successfully")
      res.redirect('/admin/users')
    })
    .catch(err => {
      console.log(err)
      req.flash("errorMessage", "there was an error updating")
      res.redirect('/admin/users')
    })

});


//----------------------------------------------delete user--------------------------
router.post('/admin/users/delete/:id', isAuthenticated, isAdmin, (req, res) => {

  User.destroy({
    where: { id: req.params.id }
  })

    .then(() => {
      console.log("User deleted successfully")
      res.redirect('/admin/users')
    })
    .catch(err => {

      console.error(err);
    });
});




module.exports = router;


























// const AdminJS           = require('adminjs')
// const AdminJSExpress    = require('@adminjs/express')
// const AdminJSSequelize  = require('@adminjs/sequelize')


// AdminJS.registerAdapter(AdminJSSequelize)


// const adminJs = new AdminJS({
//   rootPath: '/admin',
//   resources: [
//     {
//       resource: User,
//       options:
//         { listProperties: ['firstName', 'lastName', 'email', 'status'] },

//         properties:
//       {
//       uuid: {isVisible: { list: true, filter: true, show: true, edit: true },},
//       firstName: {isVisible: { list: true, filter: true, show: true, edit: true },},
//       lastName: {isVisible: { list: true, filter: true, show: true, edit: true },},
//       email: {isVisible: { list: true, filter: true, show: true, edit: true },},
//       status: {isVisible: { list: true, filter: true, show: true, edit: true },},
//       },
//       actions: {
//         show: {
//           icon: 'View',
//           isVisible: (context) => context.record.param('email') !== '',
//         },
//       },
//     },
//   ],
//   logoutPath: '/',
//   loginPath: '/login',
//   branding: {
//   logo: 'https://th.bing.com/th/id/OIP.dCJk51QZStzKwKelbyaz2AHaHa?pid=ImgDet&rs=1',
//   companyName: 'La BADR',
//   softwareBrothers: false   // if Software Brothers logos should be shown in the sidebar footer
// },
// })

// const adminRouter  = AdminJSExpress.buildRouter(adminJs)

// module.exports = adminRouter 