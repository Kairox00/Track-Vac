require('dotenv').config()
const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    //bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
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
const review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const vaccinated = require('./models/vaccinated');
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
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
    res.render('home', { page: "home" })
})

//Choose Center Page
app.get('/centers', catchAsync(async (req, res) => {
    // Center.find({},(err,centers)=>{
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         res.render('centers',{centers: centers, cityNames: cityNames})
    //     }
    // })
    const centers = await Center.find({});
    res.render('centers', { cityNames: cityNames, page: 'centers',centers })
}))

//filtering
app.post('/centers', catchAsync(async (req, res, next) => {
    const { govSelect, districtSelect } = req.body;
    //console.log(govSelect,districtSelect);
    const centers = await Center.find({governorate: govSelect,district: districtSelect });
    //console.log(centers);
    res.render('centers', { cityNames: cityNames, centers });
}))

//Center Page
app.get('/centers/:centerId', catchAsync(async (req, res) => {
    let centerId = req.params.centerId;
    //if exists in database
    const center= await Center.findById(req.params.centerId).populate('reviews');
    let totalRating =0;
    for(let review of center.reviews){
        totalRating+=review.rating;
    }
    const totalReviews=center.reviews.length!=0?center.reviews.length:1;
    const avgRating = totalRating/totalReviews;
    console.log(center);
    //console.log(center);
    res.render('center_page',{center,avgRating});
    //else display error
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
    review.findByIdAndUpdate(req.params.reviewId,{is_reported: true},(err,review)=>{
        if(err)
            res.send(err);
        else
            console.log(req.params.reviewId + " reported");
    })
})

app.put('/centers/:centerId/upvote/:reviewId',(req,res)=>{
    let review = reviews.findById(req.params.reviewId,(err,review)=>{
        if(err)
            res.send(err);
    })
    let upvotes = review.upvotes++;
    reviews.findByIdAndUpdate(req.params.reviewId,{upvotes: upvotes}, (err, review)=>{
        if(err)
            res.send(err);
        else
            console.log(req.params.reviewId + " upvoted");
    })
})

//Create Review Page
app.get('/centers/:centerId/addReview', catchAsync(async(req, res) => {
    const center=await Center.findById(req.params.centerId);
    res.render('addReview', { cityNames:cityNames ,page: "addReview", center: center})

}))

//post review
app.post('/centers/:centerId/addReview', catchAsync(async (req, res, next) => {
    
    ///const vaccinatedUser = await vaccinated.find({vaccination_code:vaccination_code,id_digits:id_digits});
    // const center = await Center.find({ governrate: governorate,name:vaccination_center,area:district});
    // if(!vaccinatedUser){
    //     req.flash('error','You Must Be Vaccinated To Add a Review')
    //     return res.redirect(`/centers/${Center._id}`);
    // }
    
   
    // req.flash('Success','Review Added Successfully')
    // let newReview = req.body.review;
    // console.log(newReview);
    let centerId = req.params.centerId;
    const center = await Center.findById(centerId);
    const addedReview=await new review(req.body.review);
     center.reviews.push(addedReview);
    await center.save();
    await addedReview.save();
    res.redirect(`/centers/${center._id}`);
    
}));

//About Page
app.get('/about', (req, res) => {
    res.render('about', { page: "about" })
})

//==================
// MODERATOR ROUTES
//==================


app.get('/moderator', (req, res) => {
    res.render('moderator', { page: "moderator" })
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
            res.redirect('/modHome')
        }
        else {
            res.redirect('/moderator');
        }


    }
);

app.get('/modHome',async (req, res) => {
    const reviews = await review.find({is_reported: true});
    console.log(reviews);
    res.render('modHome', { page: "modHome" , reviews: reviews});
})

app.get('/reports', (req, res) => {
    res.render('reports', { page: "reports" });
})

app.get('/removeCenter', (req, res) => {
    res.render('removeCenter', { cityNames: cityNames, helper: helper , page:"removeCenter"});
})

app.get('/addCenter', (req, res) => {
    res.render('addCenter', { cityNames: cityNames, helper: helper, page: "addCenter" });
})

app.post('/addCenter', upload.single('image'), async (req, res) => {
    console.log(req.file.path);
    var image_url="";
    await cloudinary.uploader.upload(req.file.path, function(result) {
         image_url, req.body.image = result.secure_url;
         
    });

    const geoData = await geocoder.forwardGeocode({
        query: req.body.address,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry.coordinates);
    // console.log(image_url);
    // console.log(req.body.image);
    var newCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district
        ,address: geoData.body.features[0].geometry
    }
    console.log(newCenter);
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

