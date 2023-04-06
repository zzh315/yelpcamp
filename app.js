if (process.env.NODE_ENV !== 'production') {//process.env.NODE_ENV is an enviroment bariable that's either in development or production
    require('dotenv').config();
};
// onece required, will take variables in the .env file and add to the process.env object
// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const engine = require('ejs-mate'); // for boiletplates
const session = require('express-session');
const MongoStore = require('connect-mongo'); // for storing session in mongo
const flash = require('connect-flash'); // flash is dependent on session to function.
// const Joi = require('joi') no need as already required in schemas.js
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')


const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


// process.env.DB_URL;
// 'mongodb://127.0.0.1:27017/yelp-camp'
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//app.use will be used on every route handler(even if in seperate files)
//but order matters!
app.use(express.urlencoded({ extended: true }));// parse req.body to json
app.use(methodOverride('_method'));
//allow we use the delete and put method with POST http verb
app.use(express.static(path.join(__dirname, 'public')));
//for validateform js link to be accessable through the biolerplate.ejs

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);
// prevent use of special charcters that's vanurable for mongo

// app.use(helmet()); becasue for some reason, calling this first would ignore all the settings below.
//I noticed a mention of "In case of two Content Security Policy at the same time more strict will apply." in this Stackoverflow post from 6 months ago: https://stackoverflow.com/a/66421905/8759421 .

//below are allowed srouces
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dg3rzpkpl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // time period in seconds before update session if no data was changed
});


store.on("error", function (e) {
    console.log("Session store error!", e)
});

const sessionConfig = {
    store,
    name: 'customeSessionId', // change the default connect.sid to custom one, so that attacker wouldnt be able to target the default name.
    secret: secret, // used to sign the cookie/session to verify they are not termpered with.
    resave: false, // do not resave if session is not modified
    saveUninitialized: true, //false: don't create session until something stored
    cookie: {
        httpOnly: true, // mitigate the risk of client side script accessing the protected cookie, only accessible through http not javascript
        // secure: true,    // setting to true means only work on https(will break cookie on localhost becasue its not htpps)
        expires: Date.now() + 604800000, // 1 week
        maxAge: 604800000
    }
};
app.use(session(sessionConfig)); //session-id will be assigned to the broswer when we start browsing any route. and then the seesion-id will be sent back to server on req.session everytime we acess any route.

app.use(flash()); // add flash method on req. object




app.use(passport.initialize());
app.use(passport.session()); // need this for persistant session 
// and makesure app.use(session{()) is used before passport.session.
passport.use(new LocalStrategy(User.authenticate()));
//tell passport to use passport-local and use User to authenticate. (Kind of like a method/style/strategy of authentication )
passport.serializeUser(User.serializeUser());
//tell passport how to serialize user, aka how do we store data in the seesion, aka, login/logout
//serilizeUser and deserializeUser are automatically added on User model my passport-local-mongoose. and adds req.isAuthenticated() method
passport.deserializeUser(User.deserializeUser());
// the stategy supplys different ways of serialization depent on application.




app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
        // console.log(req.originalUrl);
    }; // set returnTo = orignalUrl expect when came from login or /
    res.locals.currentUser = req.user; // passport add req.user automatically
    res.locals.success = req.flash('success'); // every route handler will have res.locals.success varibale avaiable
    //any object in res.locals will be avaible in rendered templates(ejs). eg. you will have access to the success variable in the ejss
    // console.log(res.locals.success); //looks like you need to pass a flash msg first inorder to have somthing in flash('identifier'), otherwise its empty(although you have access to it for every route handler request)
    res.locals.error = req.flash('error');
    next();
});
// this middleware need to be used before the route handlers
//Use this property to set variables accessible in templates rendered with res.render. The variables set on res.
//locals are available within a single request-response cycle, and will not be shared between requests.

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({
//         email: 'zzh@gmail.com',
//         username: 'zzh'
//     });
//     const newUser = await User.register(user, 'monkey'); //register(user(object), password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique.
//     // need await because .register uses hash function which takes time, *and it actually saves it to mongodb
//     res.send(newUser);
// });




app.use('/campgrounds', campgroundRoutes);
// for the routes in /routes/campgrounds.js, the address will
// have /campgournds on them. and connect the 2 js file together
app.use('/campgrounds/:id/reviews', reviewRoutes); //same thing
//reviews router wouldn't have access the :id params unless we set const router = express.Router(); to {mergeParams: true}
app.use('/', userRoutes);



app.get('/', (req, res) => {
    res.render('home.ejs')
});

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'Cheap Camping' });
//     await camp.save();
//     res.send(camp);
// })




app.all('*', (req, res, next) => {
    next(new ExpressError('404 not found!!', 404))
});
// if no route matchs, it will be handled by app.all and then
// the next() pss it on to the app.use below.



app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'Oh No!, Somthing went wrong!'
    res.status(statusCode).render('error', { err });

})


const port = process.env.PORT || 3000; //usually the deployment site (render) will have process.env.PORT avaibale already.
app.listen(port, () => {
    console.log(`serving on port ${port}`);
});

