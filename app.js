require('dotenv').config()
const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
    bcrypt = require("bcrypt");
    
    


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
const user=require('./models/user');
const  passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;



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
const { reviewSchema } = require('./Schemas.js')
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
    res.locals.userId = req.session.user_id;
    res.locals.helper = helper;
    res.locals.lang = req.session.lang;
    next();
});

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
// Logged in user
//===============
const requireLogin = (req, res, next) => {
    if (req.isAuthenticated()){
        req.session.user_id=1;
      return next();}
    if (!req.session.user_id) {
      return res.redirect("/login");
    }
    next();
  };

// Passport session setup.
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

//===============
// Facebook Login
//===============
passport.use(new FacebookStrategy({
    clientID: "5283337938401135",
    clientSecret:"9500ead83487ba5ef3a574d5183e0250",
    callbackURL: "http://www.track-vac.com/facebook/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    const email= profile.id;
    const exist= await user.findOne({ email });
    if(exist){
        return  done(null, exist);
    }
  const userData = {email };
  await new user(userData).save();
  done(null, userData);
  }
));

//===============
// Google Login
//===============
passport.use(new GoogleStrategy({
    clientID: "963604943689-438i7cqjo7j52hfme9d16rhu6bed43ct",
    clientSecret: "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",
    callbackURL: "http://www.track-vac.com/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    const email= profile.id;
    const exist= await user.findOne({ email });
    if(exist){
        return  done(null, exist);
    }
  const userData = {email };
  await new user(userData).save();
  done(null, userData);
  }
));


//===============
// PUBLIC ROUTES
//===============

app.post('/ar',(req,res)=>{
    req.session.lang = 'Ar';
    // console.log("Applocal "+app.locals.lang);
    // console.log(`Session ${req.sessionID} lang: `+req.session.lang);
    const ref = req.get('Referrer');
    // console.log(ref);
    res.redirect(ref);
})

app.post('/en',(req,res)=>{
    req.session.lang = 'En';
    const ref = req.get('Referrer');
    // console.log(ref);
    res.redirect(ref);
})

//Home Page
app.get('/', (req, res) => {
    // console.log("Session lang: "+req.session.lang);
    if(req.session.lang != 'En' && req.session.lang != 'Ar'){
        req.session.lang = 'En';
        res.render('home', { page: "home" ,lang: 'En'});
    }
    else{
        // console.log("Session lang: "+req.session.lang);
        res.render('home', { page: "home" })
    }  
})

//Register
app.post( "/register",catchAsync(async (req, res) => {
      const userSchema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().min(6).max(20).required(),
      });
      const { error } = userSchema.validate(req.body);
      if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        req.flash("error", msg);
        res.redirect("/register");
      } else {
        const { email, password } = req.body;
        const otherUser = await user.findOne({ email });
        if (otherUser) {
          const msg = "You Have Already Signed Up!";
          req.flash("error", msg);
          res.redirect("/register");
        } else {
          const pass = await bcrypt.hash(password, 12);
          const newUser = new user({
            email: `${email}`,
            password: `${pass}`,
          });
          await newUser.save();
          req.session.user_id = newUser._id;
          req.flash("success", "Registeration completed successfully!");
          res.redirect("/");
        }
      }
    })
  );
 
app.get('/register', (req, res) => {
    // console.log("Session lang: "+req.session.lang);
    if(req.session.lang != 'En' && req.session.lang != 'Ar'){
        req.session.lang = 'En';
        res.render('register', { page: "SignUp" ,lang: 'En'});
    }
    else{
        // console.log("Session lang: "+req.session.lang);
        res.render('register', { page: "SignUp" })
    }  
})



//Login

app.post("/login",catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const currUser = await user.findOne({ email });
    if (currUser) {
      const valid = await bcrypt.compare(password, currUser.password);
      if (valid) {
        req.session.user_id = currUser._id;
        req.flash("success", "sucessfully logged in!");
        res.redirect("/");
      } else {
        req.flash("error", "wrong password!");
        res.redirect("/login");
      }
    } else {
      req.flash("error", "You need to register!");
      res.redirect("/register");
    }
  })
);
app.get('/login', (req, res) => {
    if(req.session.lang != 'En' && req.session.lang != 'Ar'){
        req.session.lang = 'En';
        if(req.session.user_id) res.render('home', { page: "home" ,lang: 'En'});
        else res.render('login', { page: "login" ,lang: 'En'});
    }
    else{
        // console.log("Session lang: "+req.session.lang);
        if(req.session.user_id) res.render('home', { page: "home" });
        else res.render('login', { page: "login" })
    }  
});
app.get('/facebook',
     passport.authenticate('facebook')
    );

app.get('/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
      req.session.id=1;
    res.redirect('/');
  });


app.get('/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/google/callback',
  passport.authenticate('google', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    req.session.id=1;
    res.redirect('/');
  });


//logout
app.get('/logout',requireLogin, (req, res) => {
    if (req.isAuthenticated())
        req.logOut();
    
   req.session.user_id=undefined;
   res.redirect("/login");
})

//Choose Center Page
app.get('/centers', requireLogin, catchAsync(async (req, res) => {
    const centers = await Center.find({});
    const govEN = 'Select a governorate';
    const districtEN = 'Select a district';
    const govAR = 'اختر المحافظة';
    const districtAR = 'اختر المنطقة';
    res.render('centers', { cityNames: cityNames, page: 'centers', centers, govEN,govAR,districtAR, districtEN, page: 'centers', filter: 'false' })
}))

//filtering to view the center
app.post('/centers', requireLogin, catchAsync(async (req, res, next) => {
    var govEN = 'Select a governorate';
        var districtEN = 'Select a district';
        var govAR = 'اختر المحافظة';
    var districtAR = 'اختر المنطقة';
    if (req.body.action == 'filter') {
         govEN = req.body.govSelect ? req.body.govSelect : 'Select a governorate ';
         districtEN = req.body.districtSelect ? req.body.districtSelect : 'Select a district';
        const { govSelect, districtSelect } = req.body;
        const centers = await Center.find({ governorate: govSelect, district: districtSelect });
        if (centers.length == 0) {
            var msgs=[];
            msgs.push("Sorry, there is no centers available in this area");
            msgs.push("نأسف لعدم توافر مركز فى هذا النطاق الجغرافى على موقعنا حاليا !")
            req.flash('error', msgs);
            // res.render('centers', { cityNames: cityNames, centers,gov,district,filter:'true', page:'centers'});
            res.redirect('/centers')
        }
        res.render('centers', { cityNames: cityNames, centers, govEN, districtEN,govAR,districtAR, filter: 'true', page: 'centers' });
    }
    else {
         govEN = 'Select a governorate';
         districtEN = 'Select a district';
         govAR = 'اختر المحافظة';
     districtAR = 'اختر المنطقة';
        const centers = await Center.find({});
        res.render('centers', { cityNames: cityNames, centers, govEN,govAR, districtEN,districtAR, page: 'centers', filter: 'true' });
    }
})) 

//Center Page
app.get('/centers/:centerId', requireLogin, catchAsync(async (req, res) => {
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

app.post('/centers/:centerId', requireLogin, (req, res) => {
    let centerId = req.params.centerId
    res.render('center_page')
})

app.delete('/centers/:centerId', requireLogin, (req, res) => {
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
app.get('/centers/:centerId/addReview', requireLogin, catchAsync(async (req, res) => {
    const center = await Center.findById(req.params.centerId);
    res.render('addReview', { cityNames: cityNames, page: "addReview", center: center })

}))

app.get('/chooseCenter', requireLogin, catchAsync(async (req, res) => {
    const centers = await Center.find({});
    const govEN = 'Select a governorate';
    const districtEN = 'Select a district';
    const govAR = 'اختر المحافظة';
    const districtAR = 'اختر المنطقة';
    res.render('centers', { cityNames: cityNames, page: 'addReview', centers, govEN, districtEN,govAR,districtAR, filter: 'false' })
}))

//filtering choose center to add review
app.post('/chooseCenter', requireLogin, catchAsync(async (req, res, next) => {
    var govEN = 'Select a governorate';
    var districtEN = 'Select a district';
    var govAR = 'اختر المحافظة';
    var districtAR = 'اختر المنطقة';
    if (req.body.action == 'filter') {
        if(req.body.govSelect){
            govEN = req.body.govSelect;
            govAR=req.body.govSelect;
        } 
        if(req.body.districtSelect){
            console.log(govAR,districtAR);
            districtEN = req.body.districtSelect;
            districtAR = req.body.districtSelect
        }
        const { govSelect, districtSelect } = req.body;
        const centers = await Center.find({ governorate: govSelect, district: districtSelect });
        if (centers.length == 0) {
            const messages = [];
            messages.push("Sorry, there is no centers available in this area");
            messages.push("نأسف لعدم وجود مراكز بهذا النطاق الجغرافى على موقعنا حاليا !")
            req.flash('error', messages);
            res.redirect('/chooseCenter');
        }
        console.log(govAR,districtAR);
        res.render('centers', { cityNames: cityNames, centers, page: 'addReview', filter: 'true' ,govAR,govEN,districtAR,districtEN});
    }
    else {
        const centers = await Center.find({});
        res.render('centers', { cityNames: cityNames,govAR,govEN,districtAR,districtEN, centers });
    }

}))

//post review
app.post('/centers/:centerId/addReview', requireLogin, validateReview, catchAsync(async (req, res, next) => {
    /*const { id_digits, vaccination_code } = req.body.review;
    console.log(vaccination_code);
    const user = await Vaccinated.find({ vaccination_code: vaccination_code });
    console.log(user.length);
    if (user.length == 0) {
        var msgs = [];
        msgs.push('You must be vaccinated first to be able to add a review !')
        msgs.push('يجب أن تكون حاصلا على اللقاح أولا لكى تتمكن من إضافة تقييم !')
        req.flash('error', msgs);
        res.redirect(`/centers/${req.params.centerId}/addReview`);
    }*/
    const centerId = req.params.centerId;
    const center = await Center.findById(centerId);
    req.body.review.vaccination_center = centerId;
    // console.log(req.body.review);
    const addedReview = await new Review(req.body.review);
    center.reviews.push(addedReview);
    await addedReview.save();
    await center.save();
    var msgs = [];
    msgs.push('Review added successfully !');
    msgs.push('تم إضافة التقييم بنجاح');
    req.flash('success', msgs);
    res.redirect(`/centers/${center._id}`);

}));

//REPORTING
app.put('/centers/:centerId/report/:reviewId', requireLogin, (req, res) => {
    Review.findByIdAndUpdate(req.params.reviewId, { is_reported: true }, (err, review) => {
        if (err)
            res.send(err);
        else {
            var msgs =[];
            msgs.push('Review successfully reported');
            msgs.push('تم الإبلاغ عن التقييم');
            req.flash('success', msgs);
            
            res.redirect(`/centers/${req.params.centerId}`);
        }

    })
})

//UPVOTING
app.put('/centers/:centerId/upvote/:reviewId', requireLogin, (req, res) => {
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
    const lang = req.session.lang !== undefined ? req.session.lang : 'Ar';
    res.json([{lang: lang}]);
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

