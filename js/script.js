/**
 * =========================================================================
 * DOM ELEMENT SELECTION
 * * This section selects and stores references to various HTML elements on the page.
 * This improves code efficiency by avoiding repeated DOM queries.
 * =========================================================================
 */
let searchInp = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator--humidity>.value');
let pressure = document.querySelector('.weather_indicator--pressure>.value');
let wind = document.querySelector('.weather_indicator--wind>.value');
let temperature = document.querySelector('.weather_temperature>.value');
let image = document.querySelector('.weather_image');
let forecastBlock = document.querySelector('.weather_forecast');

// OpenWeatherMap API details
let weatherAPIKey = 'daed65cefc6d5d6708915939c11b5210';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;

// City search API elements
const cityInput = document.querySelector('.weather_search');
const suggestionsList = document.querySelector('.suggestions-list');
const API_KEY = "9bf6ffecc3msh6bd6001b3068c23p16ff5ejsnd74a5f382e59";
const API_HOST = "city-and-state-search-api.p.rapidapi.com";
const API_URL = "https://city-and-state-search-api.p.rapidapi.com/cities/search?q=";

/**
 * =========================================================================
 * HELPER FUNCTIONS
 * =========================================================================
 */

/**
 * @function debounce
 * @description A utility function that returns a new function. When the new function is called, 
 * it waits a specified delay before executing the original function. This is used
 * to prevent an API call on every single keystroke.
 * @param {Function} func The function to be debounced.
 * @param {Number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * @function dayOfWeek
 * @description Converts a timestamp or the current time into a full weekday name (e.g., "Wednesday").
 * @param {Number} [dt=new Date().getTime()] - The timestamp in milliseconds. Defaults to current time.
 * @returns {String} The weekday name.
 */
let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {
        'weekday': 'long'
    });
}

/**
 * =========================================================================
 * WEATHER API & UI UPDATE FUNCTIONS
 * =========================================================================
 */

// Image mapping for weather conditions
let weatherImages = [{
    url: './assets/images/clear-sky.png',
    ids: [800]
},
{
    url: './assets/images/broken-clouds.png',
    ids: [803, 804]
},
{
    url: './assets/images/few-clouds.png',
    ids: [801]
},
{
    url: './assets/images/mist.png',
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
},
{
    url: './assets/images/rain.png',
    ids: [500, 501, 502, 503, 504]
},
{
    url: './assets/images/scattered-clouds.png',
    ids: [802]
},
{
    url: './assets/images/shower-rain.png',
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
},
{
    url: './assets/images/snow.png',
    ids: [511, 600, 601, 602, 611, 612, 615, 616, 620, 621, 622]
},
{
    url: './assets/images/thunderstorm.png',
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
}
];

/**
 * @function getWeatherByCityName
 * @description Fetches current weather data for a given city from the OpenWeatherMap API.
 * @param {String} city - The name of the city.
 * @returns {Promise<Object>} A promise that resolves to the weather data object.
 */
let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndPoint + '&q=' + city;
    let response = await fetch(endpoint);
    let weather = await response.json();
    return weather;
}

/**
 * @function getForecastByCityID
 * @description Fetches the 5-day weather forecast for a city using its OpenWeatherMap ID.
 * It filters the data to get the forecast for noon each day.
 * @param {Number} id - The city ID from OpenWeatherMap.
 * @returns {Promise<Array>} A promise that resolves to an array of daily forecast objects.
 */
let getForecastByCityID = async (id) => {
    let endpoint = forecastBaseEndPoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if (hours == 12) {
            daily.push(day);
        }
    });
    return daily;
}

/**
 * @function updateCurrentWeather
 * @description Updates the main weather display with current data.
 * @param {Object} data - The current weather data object from the API.
 */
let updateCurrentWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;

    // Determine wind direction based on degrees
    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'south';
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;

    // Format temperature
    temperature.textContent = data.main.temp > 0 ?
        '+' + Math.round(data.main.temp) :
        Math.round(data.main.temp);

    // Set weather icon based on a predefined mapping
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })
}

/**
 * @function updateForecast
 * @description Renders the 5-day weather forecast into the UI.
 * @param {Array<Object>} forecast - The array of daily forecast objects.
 */
let updateForecast = (forecast) => {
    forecastBlock.innerHTML = ''; // Clear previous forecast
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);
        let temperature = day.main.temp > 0 ?
            '+' + Math.round(day.main.temp) :
            Math.round(day.main.temp);
        let forecastItem = `
            <article class="weather_forecast_item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forecast_icon">
                <h3 class="weather_forecast_day">${dayName}</h3>
                <p class="weather_forecast_temperature">
                    <span class="value">${temperature}</span>
                    &deg;C
                </p>
            </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
    })
}

/**
 * @function fetchWeatherAndForecast
 * @description A centralized function to fetch both current weather and forecast data for a city.
 * @param {String} cityName - The name of the city to search for.
 */
const fetchWeatherAndForecast = async (cityName) => {
    try {
        const weather = await getWeatherByCityName(cityName);
        const cityID = weather.id;
        updateCurrentWeather(weather);
        const forecast = await getForecastByCityID(cityID);
        updateForecast(forecast);
        suggestionsList.innerHTML = ''; // Clear suggestions after selection
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

/**
 * @function fetchCities
 * @description Fetches a list of city suggestions from the RapidAPI endpoint based on a user's query.
 * @param {String} query - The search string entered by the user.
 */
const fetchCities = async (query) => {
    if (query.trim().length < 3) {
        suggestionsList.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_URL}${query}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cities = await response.json();
        renderSuggestions(cities);
    } catch (error) {
        console.error("Error fetching data: ", error);
        suggestionsList.innerHTML = `<li>Failed to fetch cities. Check your API key.</li>`;
    }
};

/**
 * @function renderSuggestions
 * @description Populates the suggestions list with city names returned from the API.
 * @param {Array<Object>} cities - An array of city objects.
 */
const renderSuggestions = (cities) => {
    suggestionsList.innerHTML = '';
    if (cities.length === 0) {
        suggestionsList.innerHTML = `<li>No cities found.</li>`;
        return;
    }

    cities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.state_code}, ${city.country_code}`;
        li.addEventListener('click', () => {
            cityInput.value = li.textContent;
            fetchWeatherAndForecast(city.name);
            cityInput.value = ''; // Clears the input field after a click
        });
        suggestionsList.appendChild(li);
    });
};

/**
 * =========================================================================
 * EVENT LISTENERS
 * =========================================================================
 */

/**
 * @event 'input' on cityInput
 * @description Listens for user input in the search bar and debounces API calls
 * to fetch city suggestions.
 */
cityInput.addEventListener('input', debounce((e) => {
    const query = e.target.value;
    fetchCities(query);
}, 300));

/**
 * @event 'keydown' on cityInput
 * @description Handles keyboard navigation (Arrow Up/Down) and triggers a search
 * when the "Enter" key is pressed on a selected suggestion or in the input field.
 */
cityInput.addEventListener('keydown', (e) => {
    const items = suggestionsList.querySelectorAll('li');
    let selectedItem = suggestionsList.querySelector('li.selected');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedItem) {
            const nextItem = selectedItem.nextElementSibling;
            if (nextItem) {
                selectedItem.classList.remove('selected');
                nextItem.classList.add('selected');
                nextItem.scrollIntoView({ block: 'nearest' });
            }
        } else if (items.length > 0) {
            items[0].classList.add('selected');
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedItem) {
            const prevItem = selectedItem.previousElementSibling;
            if (prevItem) {
                selectedItem.classList.remove('selected');
                prevItem.classList.add('selected');
                prevItem.scrollIntoView({ block: 'nearest' });
            }
        }
    } else if (e.key === 'Enter') {
        if (selectedItem) {
            selectedItem.click(); // Triggers the click event on the selected item
        } else {
            fetchWeatherAndForecast(cityInput.value);
            cityInput.value = ''; // Clears the input field for a direct search
        }
    }
});

/**
 * @event 'click' on document
 * @description Hides the suggestions list when the user clicks anywhere outside of
 * the search input and the suggestions container.
 */
document.addEventListener('click', (e) => {
    const suggestionsContainer = document.querySelector('.suggestions-container');
    if (!suggestionsContainer.contains(e.target) && e.target !== cityInput) {
        suggestionsList.innerHTML = '';
    }
});