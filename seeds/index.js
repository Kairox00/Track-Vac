const mongoose = require('mongoose');
const centers = require('./centers');
const Center = require('../models/center');

mongoose.connect('mongodb://localhost:27017/trackVac', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const seedDB = async () => {
    await Center.deleteMany({});
    for (let i = 0; i < centers.length; i++) {
        const c = new Center({
            name:`${centers[i].name}`,
            image:'public/Images/guc.jpg',
            governrate:`${centers[i].gonernrate}`,
            address:`${centers[i].address}`,
            map:`ss`
        })
        
        await c.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})