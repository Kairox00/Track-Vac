const cities = require("./cities.json");

function getCityDistricts(cityName){
    for(let i=0; i<cities.length; i++){
        let name = cities[i]["name"];
        if(cityName.toLowerCase() == name.toLowerCase()){
            return cities[i]['districts']
        }
    }
    return false;
}

function getCityNames(){
    let cityNames = []
    for(let i=0; i<cities.length; i++){
        cityNames.push(cities[i]["name"])
    }
    return cityNames;
}

module.exports = {
    getCityDistricts: getCityDistricts,
    getCityNames : getCityNames
}