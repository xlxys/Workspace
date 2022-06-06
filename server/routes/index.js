const express           = require('express');
const router            = express.Router();
const {isAuthenticated} = require('../config/authentification')

router.get ('/dashboard', isAuthenticated,(req, res, next) =>{
    name = req.user.firstName + ' ' + req.user.lastName
    res.render('dashboard' , {name});
} );

router.get ('/profile', isAuthenticated,(req, res, next) =>{
    info = req.user
    res.render('profile', {info});
} );

router.get ('/meet', isAuthenticated,(req, res, next) =>{
    res.render('reunion');
} );


router.get ('/chat' ,(req, res, next) =>{
    res.render('chat');
} );


module.exports = router;