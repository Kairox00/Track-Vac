let cities = [];
fetch("cities")
    .then(response => {
        return response.json();
    })
    .then(data => cities = data);


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

function map(array) {
    let result = ""
    for (let i = 0; i < array.length; i++) {
        district = array[i];
        // console.log(district);
        result += `<option value= "${district}">${district}</option>`
    }
    return result;
}

function loadDistricts() {
    let districts = getCityDistricts(value);
    console.log("Districts [" + districts + "]");
    districtDrop.innerHTML = '' + '<option value="" disabled selected>Select District</option>' + map(districts) + '';
    // console.log("html " + districtDrop.innerHTML)
}

////////////////////////////////////////////


/*
function loadCenters() {
    console.log(gov.value,district.value)
    const centers =getCenters();
    centerDrop.innerHTML = '' + '<option value="" disabled selected>Select Center</option>' + map(centers) + '';
    
}
*/
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


