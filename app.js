const express = require('express'),
app = express(),
methodOverride = require('method-override'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'); 

const port = 3000 || process.env.PORT;

app.set('view engine','ejs')
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

//===============
// PUBLIC ROUTES
//===============

//Home Page
app.get('/',(req,res)=>{
    res.render('home')
})

//Choose Center Page
app.get('/centers',(req,res)=>{
    res.render('centers')
})

//Center Page
app.get('/centers/:centerId',(req,res)=>{
    let centerId = req.params.centerId
    //if exists in database
        res.render('center_page');
    //else display error
})

//Create Review Page
app.get('/centers/:centerId/addReview',(req,res)=>{
    let centerId = req.params.centerId
    res.render('addReview')
})

app.post('/centers/:centerId',(req,res)=>{
    let centerId = req.params.centerId
    //if center not found throw err
    //else create new review in database
})

//About Page
app.get('/about',(req,res)=>{
    res.render('about')
})

//==================
// MODERATOR ROUTES
//==================

app.get('/modLogin',(req,res)=>{
    res.render('login')
})


app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})

