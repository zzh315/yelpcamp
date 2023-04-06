const User = require('../models/user.js');




module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, function (err) {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    // console.log(registeredUser);
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    // in passport 0.6.0 session and cookies are cleared after login and logout so neeed to set keepSessionInfo to true.
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // console.log(req.session.returnTo);
    //delete req.session.returnTo;  no use as we assigning a new originalUrl everytime from the app.use middleware
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'You have been logged out!')
        res.redirect('/campgrounds');
    });
};

