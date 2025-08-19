let searchInp = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator--humidity>.value');
let pressure = document.querySelector('.weather_indicator--pressure>.value');
let wind = document.querySelector('.weather_indicator--wind>.value');
let temperature = document.querySelector('.weather_temperature>.value');
let image = document.querySelector('.weather_image');
let forecastBlock = document.querySelector('.weather_forecast');
let weatherAPIKey = 'daed65cefc6d5d6708915939c11b5210';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;

let weatherImages = [
    {
        url: './assets/images/clear-sky.png',
    ids: [800]
    },
    {
    url: './assets/images/broken-clouds.png',
    ids: [803,804]
    },
    {
        url: './assets/images/few-clouds.png',
        ids: [801]
    },
    {
        url: './assets/images/mist.png',
        ids: [701,711,721,731,741,751,761,762,771,781]
    },
    {
        url: './assets/images/rain.png',
        ids: [500,501,502,503,504]
    },
    {
        url: './assets/images/scattered-clouds.png',
        ids: [802]
    },
    {
        url: './assets/images/shower-rain.png',
        ids: [520,521,522,531,300,301,302,310,311,312,313,314,321]
    },
    {
        url: './assets/images/snow.png',
        ids: [511,600,601,602,611,612,615,616,620,621,622]
    },
    {
        url: './assets/images/thunderstorm.png',
        ids: [200,201,202,210,211,212,221,230,231,232]
    }
]




let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndPoint + '&q=' + city;
    let response = await fetch(endpoint);
    let weather = await response.json();
    return weather;
}

let getForecastByCityID = async (id) => {
    let endpoint = forecastBaseEndPoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if(hours == 12) {
            daily.push(day);
        }
    });
    return daily;
}

searchInp.addEventListener('keydown', async (e) => {
    if(e.keyCode === 13) {
        let weather = await getWeatherByCityName(searchInp.value);
        let cityID = weather.id;
        updateCurrentWeather(weather);
        let forecast = await getForecastByCityID(cityID);
        updateForecast(forecast);
    }
})

let updateCurrentWeather = (data) => {
    console.log(data);
    city.textContent =  data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;
    if(deg > 45 && deg <= 135) {
        windDirection = 'East';
    }else if(deg > 135 && deg <= 225) {
        windDirection = 'south';
    }else if(deg > 225 && deg <= 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;
    temperature.textContent = data.main.temp > 0 ?
                                 '+' + Math.round(data.main.temp) :
                                Math.round(data.main.temp);
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })

}

let updateForecast = (forecast) => {
    forecastBlock.innerHTML = '';
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
let dayOfWeek  = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {'weekday':'long'});
}