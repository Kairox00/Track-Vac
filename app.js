const express = require('express'),
    app = express(),
    methodOverride = require('method-override'),
    //bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    flash = require('connect-flash');


const port = 3000 || process.env.PORT;
const Mod = require('./models/mod');
const helper = require("./helper");
const Center = require('./models/center');
const Vaccinated = require('./models/vaccinated');
const cities = require("./cities.json");
const cityNames = helper.getCityNames();



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
    res.render('centers', { cityNames: cityNames, centers })
}))

//filtering
app.post('/centers', catchAsync(async (req, res, next) => {
    const { govSelect, districtSelect } = req.body;
    const centers = await Center.find({ governrate: govSelect, area: districtSelect });
    //console.log(centers);
    res.render('centers', { cityNames: cityNames, centers });
}))


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
app.get('/addReview', catchAsync(async(req, res) => {
    const centers=await Center.find({})
    res.render('addReview', { cityNames:cityNames ,page: "addReview",centers })

}))
/* router.post('/',validateReview,catchAsync(async(req,res)=>{
    const camp = await campground.findById(req.params.id);
    const{body , rating}=req.body.reviews;
    //console.log(req.body.reviews);
    const addedReview = new review(req.body.reviews);
    //res.send(camp);
    camp.reviews.push(addedReview);
    await addedReview.save();
    await camp.save();
    req.flash('Success','Review added successfully')
    res.redirect(`/campgrounds/${camp._id}`);
})) */
//post review
app.post('/addReview', catchAsync(async (req, res, next) => {
    const { vaccination_code,id_digits,governorate,district,date,vaccination_center,vaccine,is_crowded,
        is_easy_to_get_vaccinated,is_easy_to_find,comment,rating }=req.body.review;
    const vaccinatedUser = await vaccinated.find({vaccination_code:vaccination_code,id_digits:id_digits});
    const center = await Center.find({ governrate: governorate,name:vaccination_center,area:district});
    if(!vaccinatedUser){
        req.flash('error','You Must Be Vaccinated To Add a Review')
        return res.redirect(`/centers/${Center._id}`);
    }
    const addedReview=await new review(req.body.review);
    center.reviews.push(addedReview);
    await center.save();
    await addedReview.save();
    req.flash('Success','Review Added Successfully')

    res.send(req.body.review);

}))

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
            res.render('modHome', { page: "modHome" });
        }
        else {
            res.redirect('/moderator');
        }


    }
);

app.get('/modHome', (req, res) => {
    res.render('modHome', { page: "modHome" });
})
app.get('/reports', (req, res) => {
    res.render('reports', { page: "reports" });
})

app.get('/addCenter', (req, res) => {
    res.render('addCenter', { cityNames: cityNames, helper: helper, page: "addCenter" });
})

app.post('/addCenter', (req, res) => {
    let newCenter = {
        name: req.body.name,
        image: req.body.image,
        governorate: req.body.governorate,
        district: req.body.district
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

