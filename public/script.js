let cities = [];
fetch("cities")
.then(response => {
   return response.json();
})
.then(data => cities=data);

// const districtList = document.getElementById("districtList");
const districtDrop = document.getElementById("districtSelect");
const govDrop = document.getElementById("govSelect");
let value = "";
console.log(cities);

function getValue() {
    value = govDrop.value;
    console.log(value);
    loadDistricts();
}

function getCityDistricts(cityName) {
    districtDrop.value = "";
    for (let i = 0; i < cities.length; i++) {
        let name = cities[i]["name"];
        // console.log(name);
        // console.log("value:"+ cityName);
        if (cityName.toLowerCase() === name.toLowerCase()) {
            return cities[i]['districts']
        }
    }
    return false;
}

function map(array){
    let result =""
    for(let i=0; i<array.length; i++){
        district = array[i];
        // console.log(district);
        result += `<option value= "${district}">${district}</option>`
    }
    return result;
}

function loadDistricts() {
    let districts = getCityDistricts(value);
    console.log("Districts ["+districts+"]");
    districtDrop.innerHTML = ''+ '<option value="" disabled selected>Select District</option>' + map(districts) +  '';
    // console.log("html " + districtDrop.innerHTML)
}