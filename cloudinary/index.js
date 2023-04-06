// if (process.env.NODE_ENV !== 'production') {//process.env.NODE_ENV is an enviroment bariable that's either in development or production
//     require('dotenv').config();
// };
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp',
        allowed_formats: ['png', 'jpg', 'jpeg']
    }
});


module.exports = {
    cloudinary,
    storage
}