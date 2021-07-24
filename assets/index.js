//Buttons and History
var searchInput = document.querySelector("#searchInput");
var searchButton = document.querySelector("#buttonSearch");
var historyList = document.querySelector("#historyList");
var historyTitle = document.querySelector("#historyTitle");
// Weather Stuff
var weatherPanel = document.querySelector("#weatherPanel");
var weatherContainer = document.querySelector("#weatherContainer");
var currentTemp = document.querySelector("#currentTemp");
var currentCity = document.querySelector("#currentCity");
var currentDate = currentTemp.querySelector("#currentDate");
var weatherCurrent = currentTemp.querySelector("#weatherCurrent");
var weatherIcon = currentTemp.querySelector("#weatherIcon");
var weatherMax = currentTemp.querySelector("#weatherMax");
var weatherMin = currentTemp.querySelector("#weatherMin");
var weatherUV = currentTemp.querySelector("#weatherUV");
var weatherWind = currentTemp.querySelector("#weatherWind");
// Forecast section stuff
var fcContainer = document.querySelector("#fcContainer");
var forecast = document.querySelector("#forecast");
// UIKit Modal Section
var modal = document.querySelector("#modal");
var formBody = modal.querySelector("#formBody");
var formMessage = modal.querySelector("#formMessage");
// Arrays
var exactCity;
var searchArray = [];
var historyArray = [];

function getExactCity(name){
    var city = name.adminArea5;
    var state = name.adminArea3;
    var country = name.adminArea1;
    var tempCity = [];
    if(city){tempCity.push(city);}
    if(state){tempCity.push(state);}
    if(country){tempCity.push(country);}
    return tempCity.join(", ");
}

function confirm(array){
    formBody.innerHTML = "";
    for(let i = 0; i < array.length; i++){
        var inputContainer = document.createElement("div");
        inputContainer.classList.add("inputRes-", "uk-form-controls", "uk-margin");
        var searchInput = document.createElement("input");
        searchInput.setAttribute("type", "radio");
        searchInput.setAttribute("id", "inputRes-"+i);
        searchInput.setAttribute("name", "inputRes-");
        searchInput.setAttribute("data-location", JSON.stringify(array[i]));
        inputContainer.appendChild(searchInput);
        var modalName = getExactCity(array[i]);
        var searchLabel = document.createElement("label");
        searchLabel.innerText = modalName;
        searchLabel.setAttribute("for", "inputRes-"+i);
        inputContainer.appendChild(searchLabel);
        formBody.appendChild(inputContainer);
    }
    UIkit.modal("#modal").show();
}

function historySave(location){
    exactCity = getExactCity(location);
    if(searchArray.includes(exactCity)){
        var index = searchArray.indexOf(exactCity);
        searchArray.splice(index, 1);
        historyArray.splice(index, 1);
        var nameOfCity = exactCity.split(" ").join("+");
        var searchHistoryCity = historyList.querySelector("[cityName='" + nameOfCity + "']" );
        historyList.removeChild(searchHistoryCity);
    }
    var data = {
        cityName:  exactCity,
        coords: location.latLng
    };
    if(searchArray.length == 5){
        searchArray.splice(0,1);
        historyArray.splice(0,1);
        var last = historyList.childNodes[4];
        historyList.removeChild(last);
    }
    searchArray.push(exactCity);
    historyArray.push(data);

    localHistory = {
        searchArr: searchArray,
        historyArr: historyArray
    };
    localStorage.setItem("bigjuicer", JSON.stringify(localHistory));
    updateHistoryPanel(data);
}

function getCoordinates(keyword){
    keyword = keyword.split(" ").join("+");
    var api = "https://www.mapquestapi.com/geocoding/v1/address?key=ZjlA9CrGc35cpI7w1XE39aJfVEtolMrX&location=" + keyword;
    fetch(api).then(function(res){
        if(res.ok){
            res.json().then(function(data){
                var locations = data.results[0].locations;
                if(locations.length == 1){historySave(locations[0]); getWeather(locations[0].latLng);}
                else{confirm(locations);}
            });
        }
        else{console.log(res.text);}
    });
}

function getWeather(coords){
    var weatherAPI = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coords.lat + "&lon=" + coords.lng + "&units=imperial&exclude=minutely,hourly&appid=9c7f718f9e52a502c21ce03bfb0bd1d6";
    fetch(weatherAPI).then(function(res){
        if(res.ok){
            res.json().then(function(data){
                displayWeather(data);
            });
        }
        else{console.log(res.text);}
    });
}

function updateHistoryPanel(historyData){
    historyTitle.style.display = "block";

    var newC = document.createElement("div");
    newC.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center";
    newC.textContent = historyData.cityName;
    newC.setAttribute("cityName", historyData.cityName.split(" ").join("+"));
    historyList.insertBefore(newC, historyList.firstChild);
}
function start(){
    var loadedHistory = JSON.parse(localStorage.getItem("bigjuicer"));
    if(loadedHistory){
        searchArray = loadedHistory.searchArr;
        historyArray = loadedHistory.historyArr;
        for(var i = 0; i < searchArray.length; i++){
            if(!searchArray.includes(historyArray[i])){
                console.log("updatePanel"); updateHistoryPanel(historyArray[i]);
            }
        }
    }
}

function getIcon(elem, img, desc){
    var icon = "https://openweathermap.org/img/w/" + img + ".png";
    elem.setAttribute("src", icon);
    elem.setAttribute("alt", desc);
}

function displayWeather(data){
    currentCity.textContent = exactCity;
    var todaysDate = moment.unix(data.current.dt).format("dddd, MMMM Do");
    currentDate.textContent = todaysDate;
    var iconWx = data.current.weather[0].icon;
    var wxDesc = data.current.weather[0].description + " icon";
    getIcon(weatherIcon, iconWx, wxDesc); 
    var tempCurrent = Math.floor(data.current.temp);
    weatherCurrent.textContent = "Temperature: " + tempCurrent + "°F";
    var minTemp = Math.floor(data.daily[0].temp.min);
    weatherMin.textContent = "Low: " + minTemp + "°F";
    var maxTemp = Math.floor(data.daily[0].temp.max);
    weatherMax.textContent = "High: " + maxTemp + "°F";
    var speed = data.current.wind_speed;
    weatherWind.textContent = "Wind Speed: " + speed + " mph";
    weatherUV.innerHtml = "";
    weatherUV.textContent = "UV Index: " + data.current.uvi + "";
    var uvSpan = document.createElement("span");
    var uvIndex = data.current.uvi;
    uvSpan.textConent = uvIndex;
    if(uvIndex >= 8){uvSpan.classList.add("uk-text-danger");}
    else if(uvIndex >=3){uvSpan.classList.add("uk-text-warning");}
    else{uvSpan.classList.add("uk-text-success");}
    weatherUV.appendChild(uvSpan);
    weatherPanel.style.display = "block";
    weatherContainer.style.display = "block";
    displayForecast(data.daily);
}

function displayForecast(data){
    for(var i = 1; i < 6; i++){
        var dateElem = document.querySelector("#forecastDate"+i);
        dateElem.textContent = moment.unix(data[i].dt).format("MMMM Do");
        var forecastIcon = document.querySelector("#forecastIcon"+i);
        var iconWx = data[i].weather[0].icon;
        var wxDesc = data[i].weather[0].description;
        getIcon(forecastIcon, iconWx, wxDesc);
        var minTempElem = document.querySelector("#fcMinD"+i);
        var minTemp = Math.floor(data[i].temp.min);
        minTempElem.textContent = "Low: " + minTemp + "°F";
        var maxTempElem = document.querySelector("#fcMaxD"+i);
        var maxTemp = Math.floor(data[i].temp.min);
        maxTempElem.textContent = "High: " + maxTemp + "°F";
    }
    fcContainer.style.display = "block";
}
function searchHandler(event){
    event.preventDefault();
    modal.querySelector("#formMessage").classList.remove("uk-text-primary");
    var value = searchInput.value;
    if(value){
        getCoordinates(value);
        searchInput.value = "";
    }
}
function historyHandler(event){
    if(event.target.classList.contains("#historyList")){
        var city = event.target.getAttribute("#cityName");
        getCoordinates(city);
    }
}
function modalHandler(event){
    event.preventDefault();
    var choice;
    var radios = document.getElementsByName("inputRes-");
    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){choice = JSON.parse(radios[i].getAttribute("data-location"));}
    }
    if(choice){
        UIkit.modal("#modal").hide();
        historySave(choice);
        getWeather(choice.latLng);
        modal.querySelector("#formMessage").classList.remove("uk-text-primary");
    }
    else{modal.querySelector("#formMessage").classList.add("uk-text-primary");}
}
start();
searchButton.addEventListener("click", searchHandler);
historyList.addEventListener("click", historyHandler);
modal.addEventListener("submit", modalHandler);
