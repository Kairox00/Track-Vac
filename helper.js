const cities = require("./cities.json");

function getCityDistricts(cityName) {
    for (let i = 0; i < cities.length; i++) {
        let name = cities[i]["name"];
        // console.log(name);
        // console.log("value:"+ cityName);
        if (cityName.toLowerCase() === name.toLowerCase()) {
            return cities[i]['districts']
        }
    }
    return 'false';
}

function getCityNames(){
    let cityNames = []
    for(let i=0; i<cities.length; i++){
        cityNames.push(cities[i]["name"])
    }
    return cityNames;
}

function getArabicDistricts(cityName) {
    for (let i = 0; i < cities.length; i++) {
        let name = cities[i]["name"];
        // console.log(name);
        // console.log("value:"+ cityName);
        if (cityName.toLowerCase() === name.toLowerCase()) {
            return cities[i]['ar_districts']
        }
    }
    return false;
}

function getArabicNameDis(disName,govName){
    let arabDistricts = getArabicDistricts(govName);
    let engDistricts = getCityDistricts(govName);
    let index = engDistricts.indexOf(disName);
    return arabDistricts[index];
}

function getArabicNameGov(govName){
    for(let i=0; i<cities.length ; i++){
        if(cities[i]["name"].toLowerCase() === govName.toLowerCase()){
            return cities[i]["ar_name"];
        }
    }
}

console.log(getArabicNameDis('El Nozha','Cairo'))

module.exports = {
    getCityDistricts: getCityDistricts,
    getCityNames : getCityNames,
    getArabicNameDis: getArabicNameDis,
    getArabicNameGov: getArabicNameGov
}