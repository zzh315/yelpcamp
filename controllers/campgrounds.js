const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
// geocoder will contain the forward and reverse method of geocoding

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
        .sort({ '_id': -1 });
    // console.log(campgrounds);
    res.render('campgrounds/index.ejs', { campgrounds });
};



module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};


module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // console.log(geoData.body.features);
    // if (!req.body.campground) throw new ExpressError('Missing Campground Data', 400);    no need as catchAsync exist
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //req.files is an array.
    await campground.save();
    // console.log(campground);
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        }).populate('author');
    // console.log(campground);
    // the review andauthors item in the CampgroundSchema and populate the author of the reviews
    if (!campground) {
        req.flash('error', 'Cannot find that Campground!');
        return res.redirect('/campgrounds'); // return here prevent res.render below from running.
    };
    res.render('campgrounds/show', { campground });
}


module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that Campground!');
        return res.redirect('/campgrounds'); // return here prevent res.render below from running.
    };
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    console.log(req.body.deleteImages);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }); //$pull pull element out of array
    }
    req.flash('success', 'Successfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    //this will trigger the findOneAndDelete middleware somehow
    req.flash('success', 'Successfully deleted Campground!');
    res.redirect('/campgrounds');
}