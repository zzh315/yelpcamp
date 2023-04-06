
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review.js')

module.exports.isLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {
        // req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    };
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // notice the lower case c used in joi schema
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
}; // should be placed after is logged in middleware becasue req.user._id can be undefined if not logged in
//tried using catchAsync and it works for cathing error and preventing crashing due to server side error

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); // notice the lower case c used in joi schema, no need to require joi, only needed for the schema file.
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
// if there is error, throw error to the app.use error handler
// at the bottom(at app.js acutally). if not then next() is called to proceed the
// with the rout handler

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
};