// API Keys Weather API
const apikey = '0fbec21e211c431cb2621003212110';
const apikeyOpenWeather = '4417b858eb85faf8fa29eb8347e6a77e'

// Get DOM Elements to change HTML
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

// const with URL to make API requests
const urlCurrent = (city) => 
    `https://api.weatherapi.com/v1/current.json?key=${apikey}&q=${city}&aqi=no`;

const urlForecast = (city) => 
    `https://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${city}&days=5&aqi=no&alerts=no`

const urlForecastDays = (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${apikeyOpenWeather}`

// This function get weather data and call the function that adds the data to the document
async function getWeatherByLocation(city) {
    
    // API request to fetch current weather data and converting to JSON
    const resp = await fetch(urlCurrent(city), { origin: "cors" });
    const respData = await resp.json();

    // Function call to show current weather with data as parameter
    addWeatherToPage(respData); 
}

// This function adds the data to the document
function addWeatherToPage(data) {
    
    // Get data and storing in constants according to the data
    const temp = data.current.temp_c;
    const icon = data.current.condition.icon;
    const condition = data.current.condition.text;
    const location = data.location.name;
    const country = data.location.country;

    // Formatting date and assigning to a const
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date(data.location.localtime);
    var date = today.toLocaleDateString("en-US", options);

    // Creating the div that will show the current time
    const weather = document.createElement('div');
    weather.classList.add('weather');

    // Creating the HTML with the returned weather data and inserting it into the document
    weather.innerHTML = `   
    <div class="location">
        <img src="images/location-night.svg"/>    
        <p class="location-text">${location}, ${country}</p>
    </div>
    <p class="date-text">${date}</p>
    <div class="weather-temp">
        <img src="${icon}" />
        <div class="temp-text">
            <h2>${temp}<p class="celsius">°C</p></h2>
        </div>
    </div>
    <small>${condition}</small>
    `;

    // Clearing HTML to insert new search data

    main.innerHTML = ''

    // Adding the div with the data to the document
    main.appendChild(weather)

    // Function called to check whether it is day or night according to the searched location
    isDay(data)

}

// This function get data from the forecasts of the researched location
async function getForecastByLocation(city) {
    
    // API request to fetch forecast weather data and converting to JSON
    const resp = await fetch(urlForecast(city), { origin: "cors" });
    const respData = await resp.json();

    // Function call to show forecast weather with data as parameter
    getDaysForecastByLocation(respData)
}

// This function gets forecast days data receiving the location data as a parameter
async function getDaysForecastByLocation(data) {
    
    // The coordinates of the current location are saved
    const lat = data.location.lat
    const lon = data.location.lon

    // API request to fetch forecast weather data and converting to JSON
    const respForecast = await fetch(urlForecastDays(lat, lon), { origin: "cors" });
    const respDataForecast = await respForecast.json();

    // the dates returned in this call are saved in the const
    const dates = getDatesForecast(respDataForecast)

    // This function adds the forecast data for the next days to the document
    addForecast(dates, respDataForecast)
}

// This function receives the dates and forecast data and adds this information to the document
function addForecast(dates, data) {
    // That arrays that will save the data to the forecast days are declared
    forecastMaxTemps = [];
    forecastMinTemps = [];
    forecastIcons = [];
    forecastMains = [];

    // Day counter according to array position
    var temp = 0;

    // The data for the next days is saved
    days = data.daily

    // This for will retrieve the data for each day and will save it in the specific array
    for (let i = 0; i < days.length; i++) {
        var day = days[i]

        // Min Temperature
        forecastMinTemps.push(Math.floor(day.temp.min))

        // Max Temperature
        forecastMaxTemps.push(Math.floor(day.temp.max))

        // Icons according to weather condition
        forecastIcons.push(`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`)

        // Descriptions to the weather
        forecastMains.push(day.weather[0].main)
    }

    // The div that will receive the forecasts is saved
    var divForecast = document.getElementById('forecast');

    // For each date in the 'dates', the forecast with the corresponding data will be added
    dates.forEach(element => {
        const nextDay = document.createElement('div');
        nextDay.classList.add('forecast-days');
        nextDay.innerHTML = `
            <div class="weekday">
                <p>${element}</p>
                
            </div>
            <div class="descForecast">
                <img src="${forecastIcons[temp]}" />
                <p>${forecastMains[temp]}</p>
            </div>
            <div class='temp-forecast'>
                <span>${forecastMinTemps[temp]} / ${forecastMaxTemps[temp]}</span>
            </div>
        `
        
        // The forecast is added to HTML
        divForecast.appendChild(nextDay);
        temp++; 
    })
}

// This function get dates of the forecasts and formats them
function getDatesForecast(data) {
    
    // Dates are accessed through the data and are saved
    days = data.daily

    // Arrays of forecast days and formatted days are declared
    forecastDays = []
    daysFormat = []

    // For each day of 'days' the Unix timestamp of each day is saved
    days.forEach(day => {
        forecastDays.push(day.dt)
    })

    // For each Unix Timestamp saved it will be converted and saved in a new array
    forecastDays.forEach(day => {
        var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        var s = new Date(day * 1000).toLocaleTimeString("en-US", options)

        daysFormat.push(s.split(',')[0])
    })

    // The array with formatted dates will be returned
    return daysFormat
}

// The 'submit' event of the form will be prevented to retrieve the searched location
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // The searched value is saved
    const city = search.value;

    // If the location is found, the functions that returned the current data and forecasts will be called.
    if (city) {
        getWeatherByLocation(city);
        getForecastByLocation(city);

        // The search field is cleared
        var divForecast = document.getElementById('forecast');
        divForecast.innerHTML = ''
    }
})

// This function will format and save the date
function formatDate(data) {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date(data);
    var date = today.toLocaleDateString("en-US", options)
    return date; 
}

// This function will save which day of the week
function getDay(day) {
    
    var options = { weekday: 'short'};
    var today = new Date(day);
    var dateDay = today.toLocaleDateString("en-US", options)
    
    return dateDay;
}

// This function will check the data if it is day or night and will change the background according to the result.
function isDay(data) {
    const isDay = data.current.is_day

    const body = document.getElementById('body')

    if(isDay == 0) {
        body.classList.add('isNight')
        body.classList.remove('isDay')

        
    } else {
        body.classList.add('isDay')
        body.classList.remove('isNight')
    }
}



