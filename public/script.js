let cities = [];
fetch("cities")
    .then(response => {
        return response.json();
    })
    .then(data => cities = data);

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


//changing the selected item's color in the navbar---- the classList.add method is working outside the function not inside, WHYYYY !!!????

/*
const homeTag = document.querySelector("#home");
const centersTag = document.querySelector("#allCenters");
const writeTag = document.querySelector("#write");
const aboutTag = document.querySelector("#aboutVac");

homeTag.addEventListener("click", () => {

 //alert("why isnt it working ?!");
 homeTag.classList.add("active");
 centersTag.classList.remove("active");
 writeTag.classList.remove("active");
 aboutTag.classList.remove("active");

})

centersTag.addEventListener("click", () => {

 centersTag.classList.add("active");
 homeTag.classList.remove("active");
 writeTag.classList.remove("active");
 aboutTag.classList.remove("active");

})

// ----- end

    */

