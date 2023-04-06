const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
        users.login);
// in passport 0.6.0 session and cookies are cleared after login and logout so neeed to set keepSessionInfo to true.
// failureFlash: true, have to make sure in the app.use middleware that 
// the keyword for req.flash('keyword') the keyword has to be 'error' or 'success'

router.get('/logout', users.logout);


module.exports = router;