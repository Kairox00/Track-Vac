const mongoose = require('mongoose');
const cities = require('./cities');
const Center = require('../models/center');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/trackVac', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Center.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const center = new Center({
            name: `${cities[random1000].city}, ${cities[random1000].state} Health Center`,
            image:'https://source.unsplash.com/collection/9552610/1600x900',
            map:'https://source.unsplash.com/collection/1128437/1600x900',
        })
        await center.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})