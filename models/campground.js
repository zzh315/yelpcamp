const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const opts = { toJSON: { virtuals: true } };

//https://res.cloudinary.com/dg3rzpkpl/image/upload/v1680607273/YelpCamp/pooqv85b52z5wzhdy4jy.jpg
const ImageSchema = new Schema(
    {
        url: String,
        filename: String
    }
);

ImageSchema.virtual('thumbnail').get(function () { // add return of this call back as a virtual property to ImageSchema as image.thumbnail . aka not storing in the acutal database
    return this.url.replace('/upload', '/upload/w_100');
});
ImageSchema.virtual('cardImage').get(function () {
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
});



const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' //module.exports = mongoose.model('User', UserSchema); <= in the user model file.
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' // the review model
        }
    ]
}, opts);

CampgroundSchema.post('findOneAndDelete', async function (doc) { // the found and deleted campgrounds wil be passed in here to this middleware
    if (doc) {    //incase nothing was found and there was no doc
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


CampgroundSchema.virtual('properties.popUpMarkup').get(function () { // add return of this call back as a virtual property to ImageSchema . aka not storing in the acutal database
    return `<p>${this.description.substring(0, 75)}...</p>
    <a role="button" class="btn btn-outline-danger" href="/campgrounds/${this._id}">View ${this.title}</a>`
});

//becasue mapbo accept a fiex format that read the properties key in the cluterMap.js file


//findByIdAndDelete will trigger this middleware somehow

module.exports = mongoose.model('Campground', CampgroundSchema);