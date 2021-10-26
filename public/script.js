let cities = [];
fetch("/cities")
    .then(response => {
        return response.json();
    })
    .then(data => cities = data);

let language = [];
fetch("/lang")
    .then(response =>{
        return response.json()
    }).then(
        data => {
            language = data[0].lang;
            console.log(data[0].lang);
        }
    );
console.log(language);



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

function getRef(cityName) {
    districtDrop.value = "";
    for (let i = 0; i < cities.length; i++) {
        let name = cities[i]["name"];
        // console.log(name);
        // console.log("value:"+ cityName);
        if (cityName.toLowerCase() === name.toLowerCase()) {
            return cities[i]['ref']
        }
    }
    return false;
}

function getArabicDistricts(cityName) {
    districtDrop.value = "";
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
    // console.log(arabDistricts);
    // console.log(engDistricts);
    let index = engDistricts.indexOf(disName);
    return arabDistricts[index];
}

function map(array,govName) {
    let result = ""
    for (let i = 0; i < array.length; i++) {
        let district = array[i];
        let ar_district = getArabicNameDis(district,govName)
        console.log(district +" / "+ ar_district);
        let nameShown = district;
        console.log(language)
        if(language === 'Ar')
            nameShown = ar_district;
        result += `<option value= "${district}">${nameShown}</option>`
    }
    return result;
}

function loadDistricts() {
    let districts0 = getCityDistricts(value);
    let districts = [...districts0].sort()
    console.log("Districts [" + districts + "]");
    let text = 'Select a district';
    if(language === 'Ar')
        text = 'اختر المنطقة'
    districtDrop.innerHTML = '' + `<option value="" disabled selected>${text}</option>` + map(districts,value) + '';
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


