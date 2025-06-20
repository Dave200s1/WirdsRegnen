const API_KEY = '';
const GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elemente
const cityInput = document.getElementById('city-input');
const weatherData = document.getElementById('weather-data');
const errorMessage = document.getElementById('error-message');
const searchBtn = document.getElementById('search-btn');

// Event Listener
searchBtn.addEventListener('click', function(){
    fetchWeatherData(cityInput.value.trim());
});

cityInput.addEventListener('keypress', function(e){
    if(e.key == 'Enter'){
        fetchWeatherData(cityInput.value.trim());
    }
});

// Koordinaten für eine Stadt abrufen
async function getCoordinates(city) {
    try {
        const response = await fetch(
            `${GEOCODING_API_URL}?q=${city}&limit=1&appid=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.length > 0) {
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: data[0].name,
                country: data[0].country
            };
        } else {
            throw new Error('Stadt nicht gefunden');
        }
    } catch (error) {
        throw error;
    }
}

// Wetterdaten abrufen
async function fetchWeatherData(city) {
    if (!city) return;
    
    try {
        // Zuerst Koordinaten abrufen
        const coords = await getCoordinates(city);
        
        // Dann Wetterdaten mit Koordinaten abrufen
        const response = await fetch(
            `${WEATHER_API_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=de`
        );
        const weatherData = await response.json();
        
        // Land aus den Geocoding-Daten verwenden
        weatherData.sys = weatherData.sys || {};
        weatherData.sys.country = coords.country;
        weatherData.name = coords.name;
        
        if (weatherData.cod === 200) {
            displayWeatherData(weatherData);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Fehler:', error);
        showError();
    }
}

// Daten anzeigen
function displayWeatherData(data){
    errorMessage.style.display = 'none';

    // Daten zuweisen
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Wetterdaten anzeigen
    weatherData.style.display = 'block';
}

function showError() {
    weatherData.style.display = 'none';
    errorMessage.style.display = 'block';
}

// Initial Berlin anzeigen
fetchWeatherData('Berlin');