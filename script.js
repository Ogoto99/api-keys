const apiKey = "88e1f3e172d57d58b17692421cd9cd70";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";

// Theme handling
const themeToggle = document.getElementById('themeToggle');
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize theme
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
});

// DOM Elements
const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const currentLocationButton = document.getElementById("currentLocation");
const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const weatherIconElement = document.getElementById("weatherIcon");
const feelsLikeElement = document.getElementById("feelsLike");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("windSpeed");
const pressureElement = document.getElementById("pressure");
const forecastContainer = document.getElementById("forecast");

// Event Listeners
searchButton.addEventListener("click", () => {
    const location = locationInput.value.trim();
    if (location) {
        fetchWeatherData(location);
    }
});

locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeatherData(location);
        }
    }
});

currentLocationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                alert("Error getting location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

// Fetch weather data by city name
async function fetchWeatherData(location) {
    try {
        const weatherResponse = await fetch(
            `${weatherApiUrl}?q=${location}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === "404") {
            throw new Error("City not found");
        }

        updateCurrentWeather(weatherData);

        const forecastResponse = await fetch(
            `${forecastApiUrl}?q=${location}&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);

    } catch (error) {
        handleError(error);
    }
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const weatherResponse = await fetch(
            `${weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherResponse.json();
        updateCurrentWeather(weatherData);

        const forecastResponse = await fetch(
            `${forecastApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);

    } catch (error) {
        handleError(error);
    }
}

// Weather animation functions
function createCloud() {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.top = `${Math.random() * 50}%`;
    cloud.style.animationDuration = `${15 + Math.random() * 10}s`;
    return cloud;
}

function createRainDrop() {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
    drop.style.animationDelay = `${Math.random()}s`;
    return drop;
}

function createWindParticle() {
    const particle = document.createElement('div');
    particle.className = 'wind-particle';
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = `${20 + Math.random() * 30}px`;
    particle.style.animationDuration = `${1 + Math.random()}s`;
    particle.style.animationDelay = `${Math.random()}s`;
    return particle;
}

function createSun() {
    const sun = document.createElement('div');
    sun.className = 'sun';
    return sun;
}

function clearWeatherAnimations() {
    const container = document.getElementById('weatherAnimations');
    container.innerHTML = '';
}

function updateWeatherAnimations(weatherCode) {
    clearWeatherAnimations();
    const container = document.getElementById('weatherAnimations');

    // Weather codes reference: https://openweathermap.org/weather-conditions
    if (weatherCode >= 200 && weatherCode < 300) {
        // Thunderstorm
        for (let i = 0; i < 5; i++) container.appendChild(createCloud());
        for (let i = 0; i < 50; i++) container.appendChild(createRainDrop());
    } else if (weatherCode >= 300 && weatherCode < 400) {
        // Drizzle
        for (let i = 0; i < 3; i++) container.appendChild(createCloud());
        for (let i = 0; i < 30; i++) container.appendChild(createRainDrop());
    } else if (weatherCode >= 500 && weatherCode < 600) {
        // Rain
        for (let i = 0; i < 4; i++) container.appendChild(createCloud());
        for (let i = 0; i < 40; i++) container.appendChild(createRainDrop());
    } else if (weatherCode >= 600 && weatherCode < 700) {
        // Snow
        for (let i = 0; i < 4; i++) container.appendChild(createCloud());
    } else if (weatherCode >= 700 && weatherCode < 800) {
        // Atmosphere (fog, mist, etc.)
        for (let i = 0; i < 8; i++) container.appendChild(createCloud());
    } else if (weatherCode === 800) {
        // Clear sky
        container.appendChild(createSun());
    } else if (weatherCode > 800) {
        // Clouds
        const cloudCount = Math.min(weatherCode - 800 + 2, 5);
        for (let i = 0; i < cloudCount; i++) container.appendChild(createCloud());
    }

    // Add wind particles if wind speed is high
    if (currentWindSpeed > 5) {
        const particleCount = Math.min(Math.floor(currentWindSpeed), 20);
        for (let i = 0; i < particleCount; i++) {
            container.appendChild(createWindParticle());
        }
    }
}

let currentWindSpeed = 0;

// Update current weather information
function updateCurrentWeather(data) {
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressureElement.textContent = `${data.main.pressure} hPa`;

    // Update weather animations
    currentWindSpeed = data.wind.speed;
    updateWeatherAnimations(data.weather[0].id);
}

// Update 5-day forecast
function updateForecast(data) {
    forecastContainer.innerHTML = "";
    
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes("12:00:00")
    ).slice(0, 5);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        
        const forecastItem = document.createElement("div");
        forecastItem.className = "forecast-item";
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
            <p>${Math.round(day.main.temp)}°C</p>
            <p class="forecast-description">${day.weather[0].description}</p>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Error handling
function handleError(error) {
    console.error("Error:", error);
    locationElement.textContent = error.message === "City not found" 
        ? "City not found. Please try again." 
        : "Error fetching weather data";
    temperatureElement.textContent = "";
    descriptionElement.textContent = "";
    weatherIconElement.src = "";
    feelsLikeElement.textContent = "-";
    humidityElement.textContent = "-";
    windSpeedElement.textContent = "-";
    pressureElement.textContent = "-";
    forecastContainer.innerHTML = "";
}

// Initial weather data
fetchWeatherData("Nairobi");