// Fish species data with optimal conditions
const fishData = {
    'largemouth-bass': {
        name: 'Largemouth Bass',
        optimalTempRange: [60, 75],
        goodTempRange: [55, 80],
        prefersOvercast: true,
        activityLevel: 'high'
    },
    'smallmouth-bass': {
        name: 'Smallmouth Bass',
        optimalTempRange: [55, 70],
        goodTempRange: [50, 75],
        prefersOvercast: false,
        activityLevel: 'high'
    },
    'crappie': {
        name: 'Crappie',
        optimalTempRange: [55, 70],
        goodTempRange: [50, 75],
        prefersOvercast: true,
        activityLevel: 'medium'
    },
    'bluegill': {
        name: 'Bluegill',
        optimalTempRange: [65, 80],
        goodTempRange: [60, 85],
        prefersOvercast: false,
        activityLevel: 'high'
    },
    'catfish': {
        name: 'Catfish',
        optimalTempRange: [70, 85],
        goodTempRange: [65, 90],
        prefersOvercast: true,
        activityLevel: 'medium'
    },
    'walleye': {
        name: 'Walleye',
        optimalTempRange: [50, 65],
        goodTempRange: [45, 70],
        prefersOvercast: true,
        activityLevel: 'medium'
    },
    'northern-pike': {
        name: 'Northern Pike',
        optimalTempRange: [50, 65],
        goodTempRange: [45, 70],
        prefersOvercast: true,
        activityLevel: 'high'
    },
    'muskie': {
        name: 'Muskie',
        optimalTempRange: [55, 70],
        goodTempRange: [50, 75],
        prefersOvercast: true,
        activityLevel: 'medium'
    },
    'yellow-perch': {
        name: 'Yellow Perch',
        optimalTempRange: [55, 68],
        goodTempRange: [50, 72],
        prefersOvercast: true,
        activityLevel: 'high'
    }
};

// State
let weatherData = null;
let selectedFish = 'largemouth-bass';

// DOM Elements
const getLocationBtn = document.getElementById('getLocationBtn');
const searchCityBtn = document.getElementById('searchCityBtn');
const cityInput = document.getElementById('cityInput');
const locationDisplay = document.getElementById('locationDisplay');
const fishOptions = document.querySelectorAll('input[name="fish"]');

// Event Listeners
getLocationBtn.addEventListener('click', getUserLocation);
searchCityBtn.addEventListener('click', searchByCity);

// Allow Enter key in city input
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByCity();
    }
});

fishOptions.forEach(option => {
    option.addEventListener('change', (e) => {
        selectedFish = e.target.value;
        if (weatherData) {
            updatePrediction();
        }
    });
});

// Get user's location
function getUserLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    getLocationBtn.disabled = true;
    getLocationBtn.innerHTML = '<span class="spinner"></span> Getting location...';

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherData(lat, lon);
        },
        error => {
            console.error('Error getting location:', error);
            alert('Unable to get your location. Please enable location services.');
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<span class="icon">📍</span> Use Current Location';
        }
    );
}

// Search by city name
async function searchByCity() {
    const cityName = cityInput.value.trim();

    if (!cityName) {
        alert('Please enter a city name');
        return;
    }

    searchCityBtn.disabled = true;
    searchCityBtn.innerHTML = '<span class="spinner"></span> Searching...';

    try {
        const coordinates = await geocodeCity(cityName);
        if (coordinates) {
            fetchWeatherData(coordinates.lat, coordinates.lon, cityName);
        } else {
            alert('City not found. Please try again with a different city name.');
            searchCityBtn.disabled = false;
            searchCityBtn.innerHTML = '<span class="icon">🔍</span> Search';
        }
    } catch (error) {
        console.error('Error searching city:', error);
        alert('Error searching for city. Please try again.');
        searchCityBtn.disabled = false;
        searchCityBtn.innerHTML = '<span class="icon">🔍</span> Search';
    }
}

// Geocode city name to coordinates (US and Canada only)
async function geocodeCity(cityName) {
    try {
        // Using OpenStreetMap Nominatim API for geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=5&countrycodes=us,ca`
        );

        if (!response.ok) throw new Error('Geocoding request failed');

        const data = await response.json();

        if (data && data.length > 0) {
            // Return the first result
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

// Fetch weather data from Open-Meteo API
async function fetchWeatherData(lat, lon, cityName = null) {
    try {
        // Current weather and hourly data for pressure trend
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,cloud_cover,wind_speed_10m,surface_pressure&hourly=surface_pressure&timezone=America/Indiana/Indianapolis&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');

        const data = await response.json();

        // Calculate pressure trend (comparing current to 3 hours ago)
        const currentPressure = data.current.surface_pressure;
        const hourlyPressures = data.hourly.surface_pressure;
        const threeHoursAgo = hourlyPressures[hourlyPressures.length - 4] || currentPressure;
        const pressureChange = currentPressure - threeHoursAgo;

        // Estimate water temperature based on air temperature and season
        const waterTemp = estimateWaterTemp(data.current.temperature_2m);

        weatherData = {
            airTemp: data.current.temperature_2m,
            waterTemp: waterTemp,
            pressure: currentPressure,
            pressureChange: pressureChange,
            windSpeed: data.current.wind_speed_10m,
            precipitation: data.current.precipitation,
            cloudCover: data.current.cloud_cover,
            lat: lat,
            lon: lon
        };

        updateWeatherDisplay();
        updatePrediction();

        // Get location name
        if (cityName) {
            locationDisplay.textContent = `📍 ${cityName}`;
        } else {
            fetchLocationName(lat, lon);
        }

        // Re-enable buttons
        getLocationBtn.innerHTML = '<span class="icon">📍</span> Use Current Location';
        getLocationBtn.disabled = false;
        searchCityBtn.innerHTML = '<span class="icon">🔍</span> Search';
        searchCityBtn.disabled = false;

    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Error fetching weather data. Please try again.');
        getLocationBtn.disabled = false;
        getLocationBtn.innerHTML = '<span class="icon">📍</span> Use Current Location';
        searchCityBtn.disabled = false;
        searchCityBtn.innerHTML = '<span class="icon">🔍</span> Search';
    }
}

// Estimate water temperature based on air temperature
function estimateWaterTemp(airTemp) {
    // Water temperature lags behind air temperature
    // Simple estimation: water is typically 5-10 degrees cooler in warm weather
    // and follows air temp more closely in cold weather
    const month = new Date().getMonth(); // 0-11

    if (month >= 4 && month <= 9) { // May to October (warmer months)
        return Math.round(airTemp - 8);
    } else if (month >= 10 || month <= 2) { // November to March (colder months)
        return Math.round(airTemp - 3);
    } else { // April and transitional periods
        return Math.round(airTemp - 5);
    }
}

// Fetch location name using reverse geocoding
async function fetchLocationName(lat, lon) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        locationDisplay.textContent = `📍 ${data.locality || data.city || 'Unknown'}, ${data.principalSubdivision || 'IN'}`;
    } catch (error) {
        locationDisplay.textContent = `📍 Latitude: ${lat.toFixed(2)}, Longitude: ${lon.toFixed(2)}`;
    }
}

// Update weather display
function updateWeatherDisplay() {
    document.getElementById('airTemp').textContent = `${Math.round(weatherData.airTemp)}°F`;
    document.getElementById('waterTemp').textContent = `${Math.round(weatherData.waterTemp)}°F`;
    document.getElementById('pressure').textContent = `${weatherData.pressure.toFixed(1)} hPa`;

    // Pressure trend
    let trendText = '';
    let trendIcon = '';
    if (weatherData.pressureChange > 0.5) {
        trendText = 'Rising';
        trendIcon = '↗️';
    } else if (weatherData.pressureChange < -0.5) {
        trendText = 'Falling';
        trendIcon = '↘️';
    } else {
        trendText = 'Stable';
        trendIcon = '→';
    }
    document.getElementById('pressureTrend').textContent = `${trendIcon} ${trendText}`;

    document.getElementById('windSpeed').textContent = `${Math.round(weatherData.windSpeed)} mph`;

    // Precipitation
    if (weatherData.precipitation > 0) {
        document.getElementById('precipitation').textContent = `${weatherData.precipitation.toFixed(2)} in`;
    } else {
        document.getElementById('precipitation').textContent = 'None';
    }

    document.getElementById('cloudCover').textContent = `${weatherData.cloudCover}%`;

    // Conditions summary
    let conditions = '';
    if (weatherData.cloudCover > 75) {
        conditions = 'Overcast';
    } else if (weatherData.cloudCover > 50) {
        conditions = 'Mostly Cloudy';
    } else if (weatherData.cloudCover > 25) {
        conditions = 'Partly Cloudy';
    } else {
        conditions = 'Clear';
    }

    if (weatherData.precipitation > 0.1) {
        conditions += ', Rainy';
    }

    document.getElementById('conditions').textContent = conditions;
}

// Calculate fishing prediction
function updatePrediction() {
    const fish = fishData[selectedFish];
    const factors = [];
    let totalScore = 0;
    let maxScore = 0;

    // Temperature evaluation (35 points)
    maxScore += 35;
    if (weatherData.waterTemp >= fish.optimalTempRange[0] &&
        weatherData.waterTemp <= fish.optimalTempRange[1]) {
        totalScore += 35;
        factors.push({
            type: 'positive',
            icon: '🌡️',
            text: `Perfect water temperature (${weatherData.waterTemp}°F) for ${fish.name}`
        });
    } else if (weatherData.waterTemp >= fish.goodTempRange[0] &&
               weatherData.waterTemp <= fish.goodTempRange[1]) {
        totalScore += 20;
        factors.push({
            type: 'neutral',
            icon: '🌡️',
            text: `Acceptable water temperature (${weatherData.waterTemp}°F), but not ideal`
        });
    } else {
        factors.push({
            type: 'negative',
            icon: '🌡️',
            text: `Water temperature (${weatherData.waterTemp}°F) is outside optimal range`
        });
    }

    // Barometric pressure trend (30 points)
    maxScore += 30;
    if (weatherData.pressureChange < -0.5) {
        totalScore += 30;
        factors.push({
            type: 'positive',
            icon: '📉',
            text: 'Falling barometric pressure - fish are actively feeding!'
        });
    } else if (weatherData.pressureChange > -0.5 && weatherData.pressureChange < 0.5) {
        totalScore += 20;
        factors.push({
            type: 'neutral',
            icon: '➡️',
            text: 'Stable pressure - moderate fishing activity'
        });
    } else {
        totalScore += 10;
        factors.push({
            type: 'negative',
            icon: '📈',
            text: 'Rising pressure - fish may be less active'
        });
    }

    // Wind conditions (15 points)
    maxScore += 15;
    if (weatherData.windSpeed >= 5 && weatherData.windSpeed <= 15) {
        totalScore += 15;
        factors.push({
            type: 'positive',
            icon: '💨',
            text: `Good wind speed (${Math.round(weatherData.windSpeed)} mph) creates surface activity`
        });
    } else if (weatherData.windSpeed < 5) {
        totalScore += 10;
        factors.push({
            type: 'neutral',
            icon: '💨',
            text: 'Light wind - calm conditions'
        });
    } else {
        totalScore += 5;
        factors.push({
            type: 'negative',
            icon: '💨',
            text: `High wind (${Math.round(weatherData.windSpeed)} mph) may make fishing difficult`
        });
    }

    // Cloud cover (10 points)
    maxScore += 10;
    if (fish.prefersOvercast && weatherData.cloudCover > 60) {
        totalScore += 10;
        factors.push({
            type: 'positive',
            icon: '☁️',
            text: `${fish.name} prefer overcast conditions`
        });
    } else if (!fish.prefersOvercast && weatherData.cloudCover < 40) {
        totalScore += 10;
        factors.push({
            type: 'positive',
            icon: '☀️',
            text: 'Clear skies favor this species'
        });
    } else {
        totalScore += 5;
        factors.push({
            type: 'neutral',
            icon: '🌤️',
            text: 'Cloud cover is acceptable'
        });
    }

    // Precipitation (10 points)
    maxScore += 10;
    if (weatherData.precipitation > 0.2) {
        totalScore += 3;
        factors.push({
            type: 'negative',
            icon: '🌧️',
            text: 'Heavy rain may reduce fishing success'
        });
    } else if (weatherData.precipitation > 0 && weatherData.precipitation <= 0.2) {
        totalScore += 10;
        factors.push({
            type: 'positive',
            icon: '🌦️',
            text: 'Light rain can trigger feeding activity'
        });
    } else {
        totalScore += 7;
        factors.push({
            type: 'neutral',
            icon: '✅',
            text: 'No precipitation'
        });
    }

    // Calculate percentage
    const percentage = (totalScore / maxScore) * 100;

    // Display prediction
    displayPrediction(percentage, fish.name, factors);
}

// Display prediction result
function displayPrediction(percentage, fishName, factors) {
    const resultDiv = document.getElementById('predictionResult');
    const detailsDiv = document.getElementById('predictionDetails');

    let rating, icon, message, className;

    if (percentage >= 80) {
        rating = 'Excellent';
        icon = '🎣';
        message = `Perfect conditions for ${fishName}! Get out there now!`;
        className = 'excellent';
    } else if (percentage >= 60) {
        rating = 'Good';
        icon = '👍';
        message = `Good conditions for ${fishName}. Should be a productive day!`;
        className = 'good';
    } else if (percentage >= 40) {
        rating = 'Fair';
        icon = '🤔';
        message = `Fair conditions for ${fishName}. They might bite with the right technique.`;
        className = 'fair';
    } else {
        rating = 'Poor';
        icon = '😕';
        message = `Challenging conditions for ${fishName}. Consider trying another day.`;
        className = 'poor';
    }

    resultDiv.className = `prediction-result ${className}`;
    resultDiv.innerHTML = `
        <div class="prediction-icon">${icon}</div>
        <div class="prediction-title">${rating} Conditions</div>
        <div class="prediction-message">${message}</div>
        <div style="font-size: 1.5rem; font-weight: 600; margin-top: 10px;">
            Bite Score: ${Math.round(percentage)}%
        </div>
    `;

    // Display factors
    const factorHTML = factors.map(factor => `
        <div class="factor-item ${factor.type}">
            <span class="factor-icon">${factor.icon}</span>
            <span class="factor-text">${factor.text}</span>
        </div>
    `).join('');

    detailsDiv.innerHTML = `
        <h3>Condition Analysis</h3>
        <div class="factor-list">
            ${factorHTML}
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Indiana Fish Bite Predictor loaded');
});
