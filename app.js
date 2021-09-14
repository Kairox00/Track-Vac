const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    // bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local');


const port = 3000 || process.env.PORT;
const Mod = require('./models/mod');

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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Mod.authenticate()));
passport.serializeUser(Mod.serializeUser());
passport.deserializeUser(Mod.deserializeUser());

mongoose.connect('mongodb://localhost:27017/trackVac', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

//===============
// PUBLIC ROUTES
//===============

//Home Page
app.get('/', (req, res) => {
    res.render('home')
})

//Choose Center Page
app.get('/centers', (req, res) => {
    res.render('centers')
})

//Center Page
app.get('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    //if exists in database
    res.render('center_page');
    //else display error
})

//Create Review Page
app.get('/centers/:centerId/addReview', (req, res) => {
    let centerId = req.params.centerId
    res.render('addReview')
})

app.get('/addReview', (req, res) => {
    //let centerId = req.params.centerId
    res.render('addReview')
})

app.post('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    //if center not found throw err
    //else create new review in database
})

//About Page
app.get('/about', (req, res) => {
    res.render('about')
})

//==================
// MODERATOR ROUTES
//==================

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
})



app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

