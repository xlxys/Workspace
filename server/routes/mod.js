const express = require('express');
const router = express.Router();

// roles configuration
const { isAuthenticated, isManager, isModerator } = require('../config/middleware')

// database tables
const Member = require('../models').Member
const Meet = require('../models').Meet


router.post('/meet/:uuid', isAuthenticated, (req, res) => {
    Member.findAll({
        where: { UserId: req.user.id }
    })
        .then((member) => {
            if (member) {
                Meet.findOne({
                    where: { uuid: req.params.uuid }
                })
                    .then((meet) => {
                        if (meet.id === member.MeetId) {
                            if (member.moderator == 1) {








                            }
                        }
                        else {
                            req.flash("errorMessage", " you dont have permission to access this meet");
                            res.redirect("/meet/");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
            else {
                req.flash("errorMessage", " you dont have permission to access this meet");
                res.redirect("/meet");
            }
        })
        .catch((err) => {
            console.log(err);
        })

});




module.exports = router;