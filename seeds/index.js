const mongoose = require('mongoose');
const centers = require('./centers');
const Center = require('../models/center');

mongoose.connect("mongodb+srv://trackapp:trackpass@trackvac.8zfh7.mongodb.net/TrackVac?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

const seedDB = async () => {
    await Center.deleteMany({});
    for (let i = 0; i < centers.length; i++) {
        const c = new Center({
            name:`${centers[i].name} health center`,
            image:'public/Images/guc.jpg',
            governrate:`${centers[i].governrate}`,
            district:`${centers[i].district}`,
            map:`ss`
        })
        
        await c.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})