const APIkey = "9a1ef4b357aa8b1ab5a4fce1c51a6966";
let searchInput = "";
const todayCard = $('#today');
const fiveDayForecast = $('#forecast');
let searchHistory = [];

// Search button event
$('#search-button').on('click', function (event) {
    event.preventDefault();
    searchInput = $('#search-input').val().trim();

    if (!searchInput) return; // prevent empty input

    getWeather(searchInput);
    addToButtons(searchInput);
});

// Get weather data by city
function getWeather(city) {
    todayCard.empty();
    $('#forecast-title').empty();
    fiveDayForecast.empty();

    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIkey}`;

    $.ajax({ url: geoURL, method: "GET" }).then(function (geoRes) {
        if (!geoRes.length) {
            alert("City not found.");
            return;
        }

        const { lat, lon } = geoRes[0];
        const queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}&cnt=40&appid=${APIkey}`;

        $.ajax({ url: queryURL, method: "GET" }).then(function (response) {
            displayTodayWeather(response);
            displayFiveDayForecast(response);
        }).catch(() => alert("Error fetching weather data."));
    }).catch(() => alert("Error fetching location data."));
}

// Display today's weather
function displayTodayWeather(response) {
    const todayDiv = $('<div>').addClass("card today-card p-4");

    const cityNameAndDate = $('<h2>').text(
        `${response.city.name} (${moment(response.list[0].dt_txt).format('DD/MM/YY')})`
    );

    const iconCode = response.list[0].weather[0].icon;
    const todayIcon = $('<img>').attr({
        src: `https://openweathermap.org/img/w/${iconCode}.png`,
        height: "50px",
        width: "50px"
    });

    const temp = (response.list[0].main.temp_max - 273.15).toFixed(2);
    const wind = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    const tempP = $('<p>').text(`Temp: ${temp} °C`);
    const windP = $('<p>').text(`Wind: ${wind} KPH`);
    const humidityP = $('<p>').text(`Humidity: ${humidity}%`);

    todayCard.append(todayDiv);
    todayDiv.append(cityNameAndDate, todayIcon, tempP, windP, humidityP);
}

// Display 5-day forecast
function displayFiveDayForecast(response) {
    const forecastTitle = $('<h4>').text("5-Day Forecast:");
    $('#forecast-title').append(forecastTitle);

    for (let i = 7; i < response.list.length; i += 8) {
        const forecast = response.list[i];
        const forecastDiv = $('<div>').addClass("card forecast-card m-3");
        const forecastCard = $('<div>').addClass("card-body");

        const date = $('<h5>').addClass("card-title").text(
            moment(forecast.dt_txt).format('DD/MM/YY')
        );

        const icon = $('<img>').attr({
            src: `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`,
            height: "50px",
            width: "50px"
        });

        const temp = $('<p>').text(`Temp: ${(forecast.main.temp_max - 273.15).toFixed(2)} °C`);
        const wind = $('<p>').text(`Wind: ${forecast.wind.speed} KPH`);
        const humidity = $('<p>').text(`Humidity: ${forecast.main.humidity}%`);

        forecastCard.append(date, icon, temp, wind, humidity);
        forecastDiv.append(forecastCard);
        fiveDayForecast.append(forecastDiv);
    }
}

// Add button to search history
function addToButtons(city) {
    if (!city || searchHistory.includes(city)) return;

    const button = $('<button>').text(city).addClass('search-history mb-3').attr("data-name", city);
    $('#history').append(button);

    searchHistory.push(city);
    localStorage.setItem("search-term", JSON.stringify(searchHistory));
}

// On click of history button
$(document).on("click", ".search-history", function () {
    const city = $(this).attr("data-name");
    getWeather(city);
});

// Render history buttons on page load
function renderButtons() {
    const storedHistory = JSON.parse(localStorage.getItem("search-term"));

    if (!storedHistory) return;

    searchHistory = storedHistory;
    searchHistory.forEach(city => {
        const button = $('<button>').text(city).addClass('search-history mb-3').attr("data-name", city);
        $('#history').append(button);
    });
}

// Clear history
$('#clear-history').on("click", function () {
    searchHistory = [];
    localStorage.removeItem("search-term");
    $('#history').empty();
});

// Initialize
renderButtons();
