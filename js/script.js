let searchInp = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator weather_indicator--humidity>.value');
let wind = document.querySelector('.weather_indicator weather_indicator--wind>.value');
let temperature = document.querySelector('.weather_indicator weather_indicator--temperature>.value');
let image = document.querySelector('.weather_image');
let weatherAPIKey = 'daed65cefc6d5d6708915939c11b5210';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;

let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndPoint + '&q=' + city;
    let response = await fetch(endpoint);
    let weather = await response.json();
    return weather;
}

searchInp.addEventListener('keydown', async (e) => {
    if(e.keyCode === 13) {
        let weather = await getWeatherByCityName(searchInp.value);
        updateCurrentWeather(weather);
    }
})

let updateCurrentWeather = (data) => {
    city.textContent =  data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();
}
let dayOfWeek  = () => {
    return new Date().toLocaleDateString('en-EN', {'weekday':'long'});
}