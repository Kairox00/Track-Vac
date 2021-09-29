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
const cityNames = helper.getCityNames().sort();
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const Review = require('./models/review');



var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
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
var upload = multer({ storage: storage, fileFilter: imageFilter })

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
app.use(flash());


//=================
// Error validation
//=================
const ExpressError = require('./utils/ExpressError')
const { reviewSchema } = require('./schemas.js')
const Joi = require('joi');
// const review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const center = require('./models/center');
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error && error.details.map(el => el.message).join(',') != '"review.Date" is not allowed') {
        var msg = error.details.map(el => el.message).join(',');
        if (msg == '"review.vaccination_code" must be greater than or equal to 10000000000000000000') {
            msg = "Please Enter a valid 20 digits vaccination code"
        }
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


//========================
// SESSION & MONGO CONFIG
//========================

app.use(require("express-session")({
    secret: "Secter whatev",
    resave: true,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    res.locals.helper = helper;
    next();
});

app.locals.lang = 'En';

mongoose.connect("mongodb+srv://trackapp:trackpass@trackvac.8zfh7.mongodb.net/TrackVac?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

//===============
// FLASH
//===============
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//===============
// PUBLIC ROUTES
//===============

app.post('/ar',(req,res)=>{
    app.locals.lang = 'Ar';
    res.redirect('/');
})

app.post('/en',(req,res)=>{
    app.locals.lang = 'En';
    res.redirect('/');
})

//Home Page
app.get('/', (req, res) => {
    // console.log(req.session.user);
    res.render('home', { page: "home" })
})

//Choose Center Page
app.get('/centers', catchAsync(async (req, res) => {
    const centers = await Center.find({});
    const gov = app.locals.lang === 'En' ? 'Select a Governorate' : "اختر المحافظة";
    const district = app.locals.lang === 'En' ? 'Select a District' : "اختر المنطقة";
    res.render('centers', { cityNames: cityNames, page: 'centers', centers, gov, district, page: 'centers', filter: 'false' })
}))

//filtering
app.post('/centers', catchAsync(async (req, res, next) => {
    console.log(req.body.govSelect);
    if (req.body.action == 'filter') {
        let govName ='govname'
        if(req.body.govSelect){
            //   govName = req.body.govSelect;
              if(app.locals.lang === 'Ar')
                govName = helper.getArabicNameGov(govName);
        }
         else{
             govName = app.locals.lang === 'En' ? 'Select a Governorate' : "اختر المحافظة"
         } 
        const gov = govName;
        const district = req.body.districtSelect ? req.body.districtSelect : 'Select a District';
        const { govSelect, districtSelect } = req.body;
        const centers = await Center.find({ governorate: govSelect, district: districtSelect });
        if (centers.length == 0) {
            req.flash('error', "Sorry, there is no centers available in this area");
            // res.render('centers', { cityNames: cityNames, centers,gov,district,filter:'true', page:'centers'});
            res.redirect('/centers')
        }
        res.render('centers', { cityNames: cityNames, centers, gov, district, filter: 'true', page: 'centers' });
    }
    else {
        const gov = app.locals.lang === 'En' ? 'Select a Governorate' : "اختر المحافظة";
        const district = app.locals.lang === 'En' ? 'Select a District' : "اختر المنطقة";
        const centers = await Center.find({});
        res.render('centers', { cityNames: cityNames, centers, gov, district, page: 'centers', filter: 'true' });
    }
}))

//Center Page
app.get('/centers/:centerId', catchAsync(async (req, res) => {
    let centerId = req.params.centerId;
    const center = await Center.findById(req.params.centerId).populate('reviews');
    let totalRating = 0;
    let Crowded = 0;
    let notCrowded = 0;
    let easyToFind = 0
    let notEasyToFind = 0;
    let easyToGetVaccinated = 0;
    let noteasyToGetVaccinated = 0;
    for (let review of center.reviews) {
        if (review.rating)
            totalRating += review.rating;
        if (review.is_easy_to_find == true) easyToFind++; else notEasyToFind++
        if (review.is_crowded == true) Crowded++; else notCrowded++
        if (review.is_easy_to_get_vaccinated) easyToGetVaccinated++; else noteasyToGetVaccinated++
    }
    //console.log(center.reviews)
    const totalReviews = center.reviews.length != 0 ? center.reviews.length : 1;
    const avgRating = Math.round((totalRating / totalReviews) * 10) / 10;
    res.render('center_page', { center, avgRating, Crowded, notCrowded, easyToGetVaccinated, noteasyToGetVaccinated, notEasyToFind, easyToFind, page: 'centers' });
}))

app.post('/centers/:centerId', (req, res) => {
    let centerId = req.params.centerId
    res.render('center_page')
})

app.delete('/centers/:centerId', (req, res) => {
    Review.deleteMany({ vaccination_center: req.params.centerId }).then(
        () => console.log('reviews deleted')
    ).catch((err) => { console.log(err) });

    Center.findByIdAndDelete(req.params.centerId, (err, center) => {
        if (err)
            console.log(err);
        else
            res.redirect('/centers')
    })
})


//Create Review Page
app.get('/centers/:centerId/addReview', catchAsync(async (req, res) => {
    const center = await Center.findById(req.params.centerId);
    res.render('addReview', { cityNames: cityNames, page: "addReview", center: center })

}))

app.get('/chooseCenter', catchAsync(async (req, res) => {
    const centers = await Center.find({});
    const gov = 'Select a Governorate';
    const district = 'Select a District';
    res.render('centers', { cityNames: cityNames, page: 'addReview', centers, gov, district, filter: 'false' })
}))

//filtering
app.post('/chooseCenter', catchAsync(async (req, res, next) => {
    if (req.body.action == 'filter') {
        const gov = req.body.govSelect ? req.body.govSelect : 'Select a Governorate ';
        const district = req.body.districtSelect ? req.body.districtSelect : 'Select a District';
        const { govSelect, districtSelect } = req.body;
        const centers = await Center.find({ governorate: govSelect, district: districtSelect });
        if (centers.length == 0) {
            req.flash('error', "Sorry, there is no centers available in this area");
            res.redirect('/chooseCenter');
        }
        res.render('centers', { cityNames: cityNames, centers, gov, district, page: 'addReview', filter: 'true' });
    }
    else {
        const gov = 'Select a Governorate';
        const district = 'Select a District';
        const centers = await Center.find({});
        res.render('centers', { cityNames: cityNames, centers, gov, district });
    }
}))

//post review
app.post('/centers/:centerId/addReview', validateReview, catchAsync(async (req, res, next) => {
    const { id_digits, vaccination_code } = req.body.review;
    console.log(vaccination_code);
    const user = await Vaccinated.find({ vaccination_code: vaccination_code });
    console.log(user.length);
    if (user.length == 0) {
        req.flash('error', 'You must be vaccinated');
        res.redirect(`/centers/${req.params.centerId}/addReview`);
    }
    const centerId = req.params.centerId;
    const center = await Center.findById(centerId);
    req.body.review.vaccination_center = centerId;
    // console.log(req.body.review);
    const addedReview = await new Review(req.body.review);
    center.reviews.push(addedReview);
    await addedReview.save();
    await center.save();
    req.flash('success', 'Review added successfully !')
    res.redirect(`/centers/${center._id}`);

}));

//REPORTING
app.put('/centers/:centerId/report/:reviewId', (req, res) => {
    Review.findByIdAndUpdate(req.params.reviewId, { is_reported: true }, (err, review) => {
        if (err)
            res.send(err);
        else {
            req.flash('success', 'Review successfully reported');
            res.redirect(`/centers/${req.params.centerId}`);
        }

    })
})

//UPVOTING
app.put('/centers/:centerId/upvote/:reviewId', (req, res) => {
    let centerId = req.params.centerId;
    let review = Review.findById(req.params.reviewId, (err, review) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            let upvotes = review.upvotes + 1;
            Review.findByIdAndUpdate(req.params.reviewId, { upvotes: upvotes }, (err, review) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                else {
                    res.redirect('/centers/' + centerId);
                }

            })
        }
    })


})

//DELETE REVIEW
app.delete('/centers/:centerId/delete/:reviewId', isMod, (req, res) => {
    Review.findByIdAndDelete(req.params.reviewId, (err, review) => {
        if (err)
            res.send(err);
        else
            res.redirect('/modHome')
    })
})

//About Page
app.get('/about', (req, res) => {
    res.render('about', { page: "about" })
})


//==================
// MODERATOR ROUTES
//==================

//MOD AUTH PAGE
app.get('/mod', (req, res) => {
    res.render('moderator', { page: "moderator" })
})

app.post('/mod',
    (req, res) => {
        if (req.body.authKey === "key") {
            req.session.user = 'mod';
            // console.log(req.session.user);
            res.redirect('/modHome')
        }
        else {
            res.redirect('/mod');
        }


    }
);

//MOD HOME 
app.get('/modHome', isMod, async (req, res) => {
    const reviews = await Review.find({ is_reported: true });
    // console.log(req.session.user);
    res.render('modHome', { page: "modHome", reviews: reviews });
})


//ADD CENTER
app.get('/addCenter', isMod, (req, res) => {
    res.render('addCenter', { cityNames: cityNames, helper: helper, page: "addCenter", page: "centers" });
})

app.post('/addCenter', isMod, upload.single('image'), async (req, res) => {
    var image_url = "";
    await cloudinary.uploader.upload(req.file.path, function (result) {
        image_url, req.body.image = result.secure_url;

    });
    console.log('here');
    const geoData = await geocoder.forwardGeocode({
        query: req.body.address,
        limit: 1
    }).send()
    var newCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district
        , address: geoData.body.features[0].geometry
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
//edit center
app.get('/centers/:centerId/editCenter', catchAsync(async (req, res) => {
    const center = await Center.findById(req.params.centerId);
    res.render('editCenter', { cityNames: cityNames, helper: helper, page: "addCenter", page: "centers", center })
}))
app.put('/centers/editCenter/:centerId', isMod, upload.single('image'), catchAsync(async (req, res) => {
    var image_url = "";
    await cloudinary.uploader.upload(req.file.path, function (result) {
        image_url, req.body.image = result.secure_url;

    });

    const geoData = await geocoder.forwardGeocode({
        query: req.body.address,
        limit: 1
    }).send()

    var editedCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district
        , address: geoData.body.features[0].geometry
    }
    const center = await Center.findByIdAndUpdate(req.params.centerId, { ...editedCenter });
    await center.save();
    req.flash('Success', 'Successfully updated center!');
    res.redirect(`/centers/${center._id}`);
}))

app.put('/centers/:centerId/ignore/:reviewId', (req, res) => {
    Review.findByIdAndUpdate(req.params.reviewId, { is_reported: false }, (err, review) => {
        if (err)
            res.send(err);
        else {
            res.redirect('/modHome')
        }

    })
})


//LOGOUT
app.get('/modHome/logout', isMod, (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});


//API
app.get('/cities', (req, res) => {
    res.json(cities);
})

app.get('/lang',(req,res)=>{
    res.json([{lang: app.locals.lang}]);
})

app.use((err, req, res, next) => {
    const { message = 'Something went wrong', statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

//HELPER
function isMod(req, res, next) {
    if (req.session.user == 'mod')
        next();
    else {
        res.redirect('/mod');
    }

}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

