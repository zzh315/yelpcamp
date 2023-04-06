const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
// const { campgroundSchema } = require('../schemas.js'); no need as already required in middleware file.
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds')

const { storage } = require('../cloudinary/index.js'); //can omit index.js as node automatically look for index.js file in a folder and run it
const multer = require('multer');
const upload = multer({ storage });
//multer() method only accepts storage or dest as variable names
// required for parsing form enctype of enctype="multipart/form-data"
// upload.single() upload image to cloudinary and stores files on req.file and the other parts of the form on req.body


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); // create new campground
// .post(upload.array('image'), (req, res) => { //upload.single('name of the html file input'). upload.array('') will accpet multiple files input(req.files)(have to add mutiple attribute on html input element)
//     console.log(req.body, req.files);
//     res.send('it worked!')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));




module.exports = router;

