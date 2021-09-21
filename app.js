require('dotenv').config()
const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");


const port = 3000 || process.env.PORT;
const Mod = require('./models/mod');
const helper = require("./helper");
const Center = require('./models/center');
const Vaccinated = require('./models/vaccinated');
const cities = require("./cities.json");
const cityNames = helper.getCityNames();
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const Review = require('./models/review');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'kairox', 
  api_key: 816413729133578, 
  api_secret: 'AnB6_XzxXsAHWC75WYXTIrlGdHk'
});




app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

//=================
// Error validation
//=================
const ExpressError = require('./utils/ExpressError')
const { reviewSchema } = require('./schemas.js')
const Joi = require('joi');
// const review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error && error.details.map(el => el.message).join(',')!='"review.Date" is not allowed') {
        var msg = error.details.map(el => el.message).join(',');
        if(msg=='"review.vaccination_code" must be greater than or equal to 10000000000000000000'){
            msg="Please Enter a valid 20 digits vaccination code"
        }
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


//=================
// PASSPORT CONFIG
//=================

app.use(require("express-session")({
    secret: "Secter whatev",
    resave: true,
    saveUninitialized: true,
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
    console.log(req.session.user);
    res.render('home', { page: "home" })
})

//Choose Center Page
app.get('/centers', catchAsync(async (req, res) => {
    const centers = await Center.find({});
    res.render('centers', { cityNames: cityNames, page: 'centers',centers })
}))

//filtering
app.post('/centers', catchAsync(async (req, res, next) => {
    const { govSelect, districtSelect } = req.body;
    const centers = await Center.find({governorate: govSelect,district: districtSelect });
    res.render('centers', { cityNames: cityNames, centers });
}))

//Center Page
app.get('/centers/:centerId', catchAsync(async (req, res) => {
    let centerId = req.params.centerId;
    const center= await Center.findById(req.params.centerId).populate('reviews');
    let totalRating =0;
    for(let review of center.reviews){
        if(review.rating)
            totalRating+=review.rating;
    }
    const totalReviews=center.reviews.length!=0?center.reviews.length:1;
    const avgRating = Math.ceil(totalRating/totalReviews);
    res.render('center_page',{center,avgRating});
}))

app.post('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    res.render('center_page')
})
// the center page fake route just for testing
app.get('/center_page', (req, res) => {
    res.render('center_page')
})

app.put('/centers/:centerId/report/:reviewId',(req,res)=>{
    Review.findByIdAndUpdate(req.params.reviewId,{is_reported: true},(err,review)=>{
        if(err)
            res.send(err);
        else{
            res.redirect('/modHome')
        }
            
    })
})

app.put('/centers/:centerId/upvote/:reviewId',(req,res)=>{
    let centerId = req.params.centerId;
    let review = Review.findById(req.params.reviewId,(err,review)=>{
        if(err){
            console.log(err);
            res.send(err);
        }  
        else{
            let upvotes = review.upvotes+1;
            Review.findByIdAndUpdate(req.params.reviewId,{upvotes: upvotes}, (err, review)=>{
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                res.redirect('/centers/'+centerId);
            }
           
    })
        }
    })
   
   
})

app.delete('/centers/:centerId/delete/:reviewId',(req,res)=>{
    Review.findByIdAndDelete(req.params.reviewId,(err,review)=>{
        if(err)
            res.send(err);
        else
            res.redirect('/modHome')
    })
})

//Create Review Page
app.get('/centers/:centerId/addReview', catchAsync(async(req, res) => {
    const center=await Center.findById(req.params.centerId);
    res.render('addReview', { cityNames:cityNames ,page: "addReview", center: center})

}))

//post review
app.post('/centers/:centerId/addReview',validateReview, catchAsync(async (req, res, next) => {
    const {id_digits,vaccination_code}=req.body.review;
    const user = await Vaccinated.find({vaccination_code:vaccination_code,id_digits:id_digits});
    if(!user.length){
        throw new ExpressError('You Must Be Vaccinated To Be Able To Add a Review',400);
    }
    const centerId = req.params.centerId;
    const center = await Center.findById(centerId);
    const addedReview=await new Review(req.body.review);
    center.reviews.push(addedReview);
    await addedReview.save();
    await center.save();
    res.redirect(`/centers/${center._id}`);
    
}));

//About Page
app.get('/about', (req, res) => {
    res.render('about', { page: "about" })
})

//==================
// MODERATOR ROUTES
//==================


app.get('/mod', (req, res) => {
    res.render('moderator', { page: "moderator" })
})

app.post('/mod',
    //   passport.authenticate('local',{failureRedirect:'/moderator'}),
    //   function(req, res) {
    //     // If this function gets called, authentication was successful.
    //     // `req.user` contains the authenticated user.
    //     res.redirect('/');
    // }
    (req, res) => {
        if (req.body.authKey === "key") {
            req.session.user = {user: "mod"};
            res.redirect('/modHome')
        }
        else {
            res.redirect('/moderator');
        }


    }
);

app.get('/modHome', isMod ,async (req, res) => {
    const reviews = await Review.find({is_reported: true});
    console.log(req.session.user);
    res.render('modHome', { page: "modHome" , reviews: reviews});
})

app.get('/reports', isMod ,(req, res) => {
    res.render('reports', { page: "reports" });
})

app.get('/removeCenter', (req, res) => {
    res.render('removeCenter', { cityNames: cityNames, helper: helper , page:"removeCenter"});
})

app.get('/addCenter', isMod ,(req, res) => {
    res.render('addCenter', { cityNames: cityNames, helper: helper, page: "addCenter" });
})

app.post('/addCenter', isMod ,upload.single('image'), async (req, res) => {
    var image_url="";
    await cloudinary.uploader.upload(req.file.path, function(result) {
         image_url, req.body.image = result.secure_url;
         
    });

    const geoData = await geocoder.forwardGeocode({
        query: req.body.address,
        limit: 1
    }).send()
    var newCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district
        ,address: geoData.body.features[0].geometry
    }
    Center.create(newCenter, (err, newlyCreated) => {
        if (err) {
            console.log(err);
            res.send("400")
        }
        else {
            res.redirect('/centers')
        }

    })
})

app.get('/modHome/logout',isMod,(req,res)=>{
    req.session.user = undefined;
    res.redirect('/');
});


app.get('/cities', (req, res) => {
    res.json(cities);
})

app.use((err,req,res,next)=>{
    const {message='Something went wrong',statusCode=500}=err;
    if(!err.message) err.message='Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{err})
})

function isMod(req,res,next){
    if(req.session.user === {user: "mod"})
        next();
    else
        res.redirect('/mod');
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

