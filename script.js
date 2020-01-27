var APIKey = "166a433c57516f51dfab1f7edaed8413";
var city = "";
var currentDate = "";
var tempF = "";
var humidityValue = "";
var windSpeed = "";
var uvIndexValue = "";
var latitude = "";
var longitude = "";
var minTempK = "";
var maxTempK = "";
var minTempF = "";
var maxTempF = "";
var dayhumidity = "";
var currentWeatherIconCode = "";
var currentWeatherIconUrl = "";
var iconcode = "";
var iconurl = "";
var city = "";
var country = "";


var listOfSearchedCities = [];
var getSeachedCitiesFromLS = JSON.parse(localStorage.getItem("searched-cities"));
if (getSeachedCitiesFromLS !== null) {
  getSeachedCitiesFromLS.forEach(function(city) {city.toUpperCase();});
  listOfSearchedCities = getSeachedCitiesFromLS;
  displayCities(listOfSearchedCities)
}

$("#search-btn").on("click", function() {
  event.preventDefault();
  clearDisplayedWeatherInfo()
  resetGlobalVariables()
  var cityName = $("input").val().toUpperCase().trim();
  
  if ((cityName !== "") && (listOfSearchedCities[0] !== cityName)) {
    listOfSearchedCities.unshift(cityName);
    localStorage.setItem("searched-cities", JSON.stringify(listOfSearchedCities));

    if (listOfSearchedCities.length === 1) {
      $("#searched-cities-card").removeClass("hide");
    }

    if ($("ul#searched-cities-list li").length >= 5) {
      ($("ul#searched-cities-list li:eq(4)").remove());
    }
    var liItem = $("<li>").text(cityName).addClass("list-group-item");
    $("#searched-cities-list").prepend(liItem);
  }

    // build URL to query the database
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + 
    cityName + "&appid=" + APIKey;

    // run the AJAX call to the OpenWatherAPI
    $.ajax({
      url: queryURL,
      method: "GET"
    })

    // store all of the retrieved data inside of an object called "response"
    .then(function(response) {
      var result = response;
      city = result.name.trim();
      var countryCode = result.sys.country;
      country = getCountryName(countryCode).trim();
      currentDate = moment().tz(country + "/" + city).format('l');
      var tempK = result.main.temp;
      // Converts the temp to Kelvin with the below formula
      tempF = ((tempK - 273.15) * 1.80 + 32).toFixed(1);
      humidityValue = result.main.humidity;
      windSpeed = result.wind.speed;
      currentWeatherIconCode = result.weather[0].icon;
      currentWeatherIconUrl = "https://openweathermap.org/img/w/" + currentWeatherIconCode + ".png";
      latitude = result.coord.lat;
      longitude = result.coord.lon;

      // var uvIndexQueryUrl = "http://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&cnt=5&appid=" + APIKey;
      var uvIndexQueryUrl = "https://api.openweathermap.org/data/2.5/uvi?&appid=" + APIKey + "&lat=" + latitude + "&lon=" + longitude;
      $.ajax({
        url: uvIndexQueryUrl,
        method: "GET"
      })
      .then(function(response) {
        uvIndexValue = response.value;
        displayCurrentWeather()
         
        var fiveDayQueryUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + city + "&appid=" + APIKey + "&cnt=5";
        $.ajax({
          url: fiveDayQueryUrl,
          method: "GET"
        })
        .then(function(response) {
          var fiveDayForecast = response.list;
          addCardDeckHeader()
          for (var i=0; i < 5; i++) {
            iconcode = fiveDayForecast[i].weather[0].icon;
            iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
            dateValue = moment().tz(country + "/" + city).add(i, 'days').format('l');
            minTempK = fiveDayForecast[i].temp.min;
            minTempF =  ((minTempK - 273.15) * 1.80 + 32).toFixed(1);
            maxTempK = fiveDayForecast[i].temp.max;
            maxTempF =  (((fiveDayForecast[i].temp.max) - 273.15) * 1.80 + 32).toFixed(1);
            dayhumidity = fiveDayForecast[i].humidity;
            displayDayForeCast()
          } 
        });      
      }); 
    });
});

function displayCurrentWeather() {
  var cardDiv = $("<div class='container border bg-light'>");
  var weatherImage = $("<img>").attr('src', currentWeatherIconUrl);
  var cardHeader = $("<h4>").text(city + " " + currentDate.toString());
  cardHeader.append(weatherImage);
  var temperatureEl = $("<p>").text("Temperature: " + tempF+ " ºF");
  var humidityEl = $("<p>").text("Humidity: " + humidityValue + "%");
  var windSpeedEl = $("<p>").text("Wind Speed: " + windSpeed + " MPH");
  var uvIndexEl = $("<p>").text("UV Index: ");
  // var uvIndexValueEl = $("<span>").text(uvIndexValue).css("background-color", getColorCodeForUVIndex(uvIndexValue)).addClass("text-white");
  var uvIndexValueEl = $("<span>").text(uvIndexValue).css("background-color", getColorCodeForUVIndex(uvIndexValue)); 
  uvIndexEl.append(uvIndexValueEl);
  cardDiv.append(cardHeader);
  cardDiv.append(temperatureEl);
  cardDiv.append(humidityEl);
  cardDiv.append(windSpeedEl);
  cardDiv.append(uvIndexEl);
  $("#current-weather-conditions").append(cardDiv);
}

function displayDayForeCast() { 
  var imgEl = $("<img>").attr("src", iconurl);  
  var cardEl = $("<div class='card'>").addClass("pl-1 bg-primary text-light");
  var cardBlockDiv = $("<div>").attr("class", "card-block");
  var cardTitleDiv = $("<div>").attr("class", "card-block");
  var cardTitleHeader = $("<h6>").text(dateValue).addClass("pt-2");
  var cardTextDiv = $("<div>").attr("class", "card-text");
  var minTempEl = $("<p>").text("Min Temp: " + minTempF + " ºF").css("font-size", "0.60rem");
  var maxTempEl = $("<p>").text("Max Temp: " + maxTempF + " ºF").css("font-size", "0.60rem");
  var humidityEl = $("<p>").text("Humidity: " + dayhumidity + "%").css("font-size", "0.60rem");

  cardTextDiv.append(imgEl);
  cardTextDiv.append(minTempEl);
  cardTextDiv.append(maxTempEl);
  cardTextDiv.append(humidityEl);
  cardTitleDiv.append(cardTitleHeader);
  cardBlockDiv.append(cardTitleDiv);
  cardBlockDiv.append(cardTextDiv);
  cardEl.append(cardBlockDiv);
  $(".card-deck").append(cardEl);
}

function addCardDeckHeader() {
  deckHeader = $("<h4>").text("5-Day Forecast").attr("id", "card-deck-title");
  deckHeader.addClass("pt-4 pt-2");
  $(".card-deck").before(deckHeader);
}

function clearDisplayedWeatherInfo() {
  $("#current-weather-conditions").empty();
  $("#card-deck-title").remove();
  $(".card-deck").empty();
}

function displayCities(citiesList) {
  $("#searched-cities-card").removeClass("hide");
  var count = 0;
  citiesList.length > 5 ? count = 5 : count = citiesList.length
  for (var i=0; i < count; i++) {
    var liEl = ($("<li>")).text(citiesList[i]).addClass("list-group-item");
    $("#searched-cities-list").append(liEl);
  }
}


function getColorCodeForUVIndex(uvIndex) {
  var uvIndexValue = parseFloat(uvIndex);
  var colorcode = "";
  if (uvIndexValue <= 2) {
    colorcode = "#00ff00";
  }
  else if ((uvIndexValue > 2) && (uvIndexValue <= 5)) {
    colorcode = "#ffff00";
  }
  else if ((uvIndexValue > 5) && (uvIndexValue <= 7)) {
    colorcode = "#ffa500";
  }
  else if ((uvIndexValue > 7) && (uvIndexValue <= 10)) {
    colorcode = "#9e1a1a";
  }
  else if (uvIndexValue > 10) {
    colorcode = "#7f00ff";
  }
  return colorcode;
}

function resetGlobalVariables() {
  city = "";
  currentDate = "";
  tempF = "";
  humidityValue = "";
  windSpeed = "";
  uvIndexValue = "";
  latitude = "";
  longitude = "";
  minTempK = "";
  maxTempK = "";
  minTempF = "";
  maxTempF = "";
  dayhumidity = "";
  currentWeatherIconCode = "";
  currentWeatherIconUrl = "";
  iconcode = "";
  iconurl = "";
  city = "";
  country = "";
}