const express = require('express'),

app = express(),
methodOverride = require('method-override'),
//bodyParser = require('body-parser'),
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

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});

mongoose.connect("mongodb+srv://trackapp:trackpass@trackvac.8zfh7.mongodb.net/TrackVac?retryWrites=true&w=majority",
{ useNewUrlParser: true , 
    useUnifiedTopology: true
});

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
app.get('/addReview',(req,res)=>{
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


app.get('/register',(req,res)=>{
    res.render("register");
});

app.post("/register", function(req, res){
    console.log(req.body.username);
    console.log(req.body.password);
    var newMod = {username: req.body.username, password:req.body.password};
    Mod.register(newMod, req.body.password, function(err, mod){
        if(err){
            console.log(err);
            res.send(err);
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/"); 
        });
        
    });
});

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',
  passport.authenticate('local',{failureRedirect:'/login'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  });



app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

