
const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers.js')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Review.deleteMany({});
    await Campground.deleteMany({});
    for (let i = 1; i <= 200; i++) {
        const random90 = Math.floor(Math.random() * 90)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '642917339f074b6bb59bf822',
            location: `${cities[random90].city}, ${cities[random90].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum recusandae blanditiis, doloribus modi, fuga tempore odio aliquid alias voluptatem cupiditate quos. Molestiae excepturi illum obcaecati cum porro a, quam asperiores.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random90].longitude, cities[random90].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dg3rzpkpl/image/upload/v1680675613/YelpSeed/nick-dunn-OzUJa5Q9m1g-unsplash_e8ju1g.jpg',
                    filename: 'YelpSeed/nick-dunn-OzUJa5Q9m1g-unsplash_e8ju1g.jpg',

                }
            ]
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})