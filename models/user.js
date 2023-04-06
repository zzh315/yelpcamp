const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);
//this will add one username and passwords on the UserSchema and with extra options that passport provide.
//add req.isAuthenticated() method
//add req.login and req.logout method.
//add req.user (and its storeed in the seesion thats loggedin)

module.exports = mongoose.model('User', UserSchema);