const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// password encrypter
const bcrypt = require('bcryptjs');

// roles configuration
const { isAuthenticated, isManager, isAdmin } = require('../config/middleware');

// database tables
const User = require('../models').User
const Member = require('../models').Member
const Meet = require('../models').Meet


//---------------------------------------dashboard--------------------------------
router.get('/dashboard', isAuthenticated, (req, res) => {

    const name = req.user.firstName + ' ' + req.user.lastName

    //------------------------ pending meets
    Member.findAll({
        attributes: ['MeetId'],
        where: {
            UserId: req.user.id
        },
        raw: true,

    }).then((membre) => {
        const names = [];
        for (i = 0; i < membre.length; i++) {
            names[i] = membre[i].MeetId;
        }

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();

        Meet.count({
            where: { id: names, meetDate: { [Op.gte]: today } },
        }).then((countMeet) => {

            //------------------------ total meets of user
            Meet.count({
                where: { id: names }
            })
                .then((countAllMeet) => {

                    percentage = countMeet * 100 / countAllMeet

                    //------------------------next week
                    var nextWeek = new Date();
                    var dd = String(nextWeek.getDate()).padStart(2, '0');
                    var mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
                    var yyyy = nextWeek.getFullYear();
                    nextWeek.setDate(nextWeek.getDate() + 7)



                    Meet.count({
                        where: {
                            id: names,
                            [Op.and]: [{ meetDate: { [Op.lte]: nextWeek } }, { meetDate: { [Op.gte]: today } }]
                        }
                    })
                        .then((weekCount) => {
                            //------------------------next month
                            var nextMonth = new Date();
                            var dd = String(nextMonth.getDate()).padStart(2, '0');
                            var mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
                            var yyyy = nextMonth.getFullYear();
                            nextMonth.setMonth(nextMonth.getMonth() + 1)

                            Meet.count({
                                where: {
                                    id: names,
                                    [Op.and]: [{ meetDate: { [Op.lte]: nextMonth } }, { meetDate: { [Op.gte]: today } }]
                                }
                            })
                                .then((monthCount) => {
                                    res.render('dashboard', { name, percentage, weekCount, monthCount });
                                })


                        })
                        .catch((err) => {
                            console.error(err)
                        })
                })
                .catch((err) => {
                    console.log(err);
                })

        }).catch((err) => {
            console.log(err)
            req.flash("errorMessage", "there was an error in the server. Please try again")
        })

    }).catch((err) => {
        console.log(err)
        req.flash("errorMessage", "there was an error in the server. Please try again")
    })


});


//---------------------------------------calendar route-----------------------------
router.get('/resource', isAuthenticated, isAdmin, (req, res) => {
    const ide = req.user.id;
    Member.findAll({
        attributes: ['MeetId'],

        where: {
            UserId: ide
        },
        raw: true,

    }).then((membre) => {
        const names = [];
        for (i = 0; i < membre.length; i++) {
            names[i] = membre[i].MeetId;
        }
        Meet.findAll({
            where: { id: names },
            raw: true
        })
            .then((meet) => {

                const meets = meet.map((obj) => {
                    return {
                        title: obj.meetName,
                        start: obj.meetDate
                    }
                });
                res.json(meets);
            })
            .catch((err) => {
                console.log(err)
                req.flash("errorMessage", "there was an error in the server. Please try again")
            })

    }).catch((err) => {
        console.log(err)
        req.flash("errorMessage", "there was an error in the server. Please try again")
    })

});

//---------------------------------------profile route--------------------------------
//------------------------get profile
router.get('/profile', isAuthenticated, (req, res) => {
    info = req.user
    res.render('profile', { info });
});

//------------------------post profile update
router.post('/profile', isAuthenticated, (req, res) => {
    const { first_name, last_name, email } = req.body

    User.update(
        { firstName: first_name, lastName: last_name, email: email },
        { where: { id: req.user.id } }
    )
        .then(() => {
            console.log('user updated successfully')
            req.flash("successMessage", "your account has been updated successfully")

        })
        .catch(err => {
            console.log(err)
            req.flash("errorMessage", "there was an error updating")
        })


    res.redirect("/profile")
});

//------------------------post profile update for password change
router.post('/profile/password', isAuthenticated, (req, res) => {
    info = req.user
    const { password, password_repeat } = req.body

    console.log(req.body)

    if (password !== password_repeat) {
        res.render('profile', { msg: "passwords does not match" })
        return
    }
    if (password.length < 3) {
        res.render('profile', { msg: "password too short" })
        return
    }
    //hash password
    var passwordhashed

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err
        passwordhashed = hash
        User.update(
            { password: hash },
            { where: { id: req.user.id } }
        )
            .then(() => {
                console.log('-----------------------------------------------------------user updated successfully',)
                req.flash("successMessage", "your account has been updated successfully")

            })
            .catch(err => {
                console.log("--------------------------------------------------------------", err)
                req.flash("errorMessage", "there was an error updating")
            })
    })

    res.render('profile', { info });
});


//---------------------------------------meets route--------------------------------
router.get('/meet', isAuthenticated, (req, res) => {
    const ide = req.user.id;
    Member.findAll({
        attributes: ['MeetId'],

        where: {
            UserId: ide
        },
        raw: true,

    }).then((membre) => {
        if (req.user.status === 'MANAGER') {
            var manager = true
        }
        const names = [];
        for (i = 0; i < membre.length; i++) {
            names[i] = membre[i].MeetId;
        }
        meet = Meet.findAll({
            attributes: ['MeetName', 'meetDate', 'room', 'Description', 'uuid', 'creator'],

            where: { id: names },

            raw: true

        }).then((meet) => {
            res.render("reunion", { membre: meet , manager : manager})

        }).catch((err) => {
            console.log(err)
            req.flash("errorMessage", "there was an error in the server. Please try again")
        })

    }

    ).catch((err) => {
        console.log(err)
        req.flash("errorMessage", "there was an error in the server. Please try again")
    })


});

router.post('/meet', isAuthenticated, isManager, (req, res) => {
    const { meetName, meetRoom } = req.body
    const description = req.body.meetDescription
    const meetDate = req.body.date + " " + req.body.time

    console.log(meetDate)
    //validation
    if (!meetName || !meetRoom || !meetDate) {
        req.flash("errorMessage", "please enter all feilds")
        return
    }


    // check if meet exist 
    Meet.findOne({
        where: {
            room: meetRoom,
            meetDate: meetDate
        }
    })
        .then((meet) => {
            if (meet) {
                console.log("exist exist")
                req.flash("errorMessage", "there is a meet this date in this room")
                res.redirect("/meet")
            }
            else {
                //create meet
                var creator = req.user.id

                const newMeet = new Meet({
                    meetName: meetName,
                    room: meetRoom,
                    description: description,
                    meetDate: meetDate,
                    creator: creator
                })
                newMeet.save()

                    .then((meet) => {
                        console.log('meet created successfully')
                        meetLink = "/Meet/" + meet.uuid

                        const newMember = new Member({
                            UserId: req.user.id,
                            MeetId: meet.id,
                            moderator: 1,
                        })
                        newMember.save()

                            .then(() => {
                                console.log('member added successfully')
                                req.flash("successMessage", "your meet has been created successfully")
                                res.redirect(meetLink)
                            })
                            .catch((err) => {
                                console.log(err)
                                req.flash("errorMessage", "there was an error creating")
                                res.redirect("/dashboard")
                            })
                    })
                    .catch((err) => {
                        console.log(err)
                        req.flash("errorMessage", "there was an error creating")
                        res.redirect("/dashboard")
                    })
            }
        })
        .catch(err => {
            console.log(err)
        })
});

//---------------------------------------meets route--------------------------------
router.get('/meet/:uuid', isAuthenticated, (req, res) => {
    Meet.findOne({
        where: { uuid: req.params.uuid }
    })
        .then((meet) => {
            if (meet) {
                
                Member.findAll({
                    where: { MeetId: meet.id }
                })
                    .then((membre) => {
                        
                        var ide = [];
                        for (i = 0; i < membre.length; i++) {
                            ide[i] = membre[i].UserId;
                        }
                        
                        var isMembre = false;
                        for (i = 0; i < ide.length; i++) {
                            if (req.user.id === ide[i]) {
                                isMembre = true;
                                break;
                            }
                        }

                        if (isMembre) {
                            res.render('chatRoom');
                        }
                        else {
                            res.send("error not a memeber");
                            req.flash("errorMessage", "you can't acces this meet")
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        req.flash("errorMessage", "server error")
                    })

            }
            else {
                res.send("error not a meet");
                req.flash("errorMessage", "doesn't exist")
            }
        })
        .catch((err) => {
            console.log(err)
            res.send("error");
            req.flash("errorMessage", "server error")
        })

});



module.exports = router;