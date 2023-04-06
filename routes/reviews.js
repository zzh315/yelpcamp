const express = require('express');
const router = express.Router({ mergeParams: true }); //reviews router wouldn't have access the :id params unless we set const router = express.Router(); to {mergeParams: true}
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
// const { reviewSchema } = require('../schemas.js'); no need as required in middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;