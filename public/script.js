let cities = [];
fetch("cities")
.then(response => {
   return response.json();
})
.then(data => cities=data);

const districtList = document.getElementById("districtList");
const districtDrop = document.getElementById("districtNames");
const cityDrop = document.getElementById("cityNames");
let value = "";
console.log(cities);

function getValue() {
    value = cityDrop.value;
    console.log(value);
    loadDistricts();
}

function getCityDistricts(cityName) {
    districtDrop.value = "";
    for (let i = 0; i < cities.length; i++) {
        let name = cities[i]["name"];
        if (cityName.toLowerCase() == name.toLowerCase()) {
            return cities[i]['districts']
        }
    }
    return false;
}

function loadDistricts() {
    let districts = getCityDistricts(value);
    console.log(districts);
    districtList.innerHTML = '' + districts.map(function (district) {
        console.log(district);
        return `<option value= "${district}">`
    }).join("") + '';
    console.log("html " + districtDrop.innerHTML)
}