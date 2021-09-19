require('dotenv').config()
const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    //bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");


const port = 3000 || process.env.PORT;
const Mod = require('./models/mod');
const helper = require("./helper");
const Center = require('./models/center');
const cities = require("./cities.json");
const cityNames = helper.getCityNames();
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

//=================
// Error validation
//=================
const ExpressError=require('./utils/ExpressError')
const {reviewSchema}= require('./schemas.js')
const Joi = require('joi');
const review=require('./models/review');
const catchAsync=require('./utils/catchAsync');
const validateReview=(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg= error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}


//=================
// PASSPORT CONFIG
//=================

app.use(require("express-session")({
    secret: "Secter whatev",
    resave: false,
    saveUninitialized: false,
}));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(Mod.authenticate()));
// passport.serializeUser(Mod.serializeUser());
// passport.deserializeUser(Mod.deserializeUser());

app.use((req, res, next) => {
    // res.locals.currentUser = req.user;
    next();
});

mongoose.connect("mongodb+srv://trackapp:trackpass@trackvac.8zfh7.mongodb.net/TrackVac?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

//===============
// PUBLIC ROUTES
//===============

//Home Page
app.get('/', (req, res) => {
    res.render('home',{page:"home"})
})

//Choose Center Page
app.get('/centers', (req, res) => {
    // Center.find({},(err,centers)=>{
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         res.render('centers',{centers: centers, cityNames: cityNames})
    //     }
    // })
    
    res.render('centers', { cityNames: cityNames, page: "centers" })
})

//Center Page
app.get('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    //if exists in database
    res.render('center_page');
    //else display error
})

app.post('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    res.render('center_page')
})
// the center page fake route just for testing
app.get('/center_page', (req, res) => {
    res.render('center_page')
})
//Create Review Page
app.get('/addReview', (req, res) => {
    res.render('addReview',{page: "addReview"})

})

//About Page
app.get('/about', (req, res) => {
    res.render('about', {page: "about"})
})

//==================
// MODERATOR ROUTES
//==================


app.get('/moderator', (req, res) => {
    res.render('moderator')
})

app.post('/moderator',
    //   passport.authenticate('local',{failureRedirect:'/moderator'}),
    //   function(req, res) {
    //     // If this function gets called, authentication was successful.
    //     // `req.user` contains the authenticated user.
    //     res.redirect('/');
    // }
    (req, res) => {
        console.log(req.body.authKey);
        if (req.body.authKey === "key") {
            res.redirect('/modHome');
        }
        else {
            res.redirect('/moderator');
        }


    }
);

app.get('/modHome', (req, res) => {
    res.render('modHome');
})

app.get('/addCenter', (req, res) => {
    res.render('addCenter', { cityNames: cityNames, helper: helper });
})

app.post('/addCenter', async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.address,
        limit: 1
    }).send()

    console.log(geoData.body.features[0].geometry.coordinates);

    let newCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district,
        address: geoData.body.features[0].geometry
    }
    Center.create(newCenter, (err, newlyCreated) => {
        if (err) {
            console.log(err);
            res.send("400")
        }
        else {
            console.log("center created");
            res.redirect('/centers')
        }

    })
})

app.get('/cities', (req, res) => {
    res.json(cities);
})



app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

