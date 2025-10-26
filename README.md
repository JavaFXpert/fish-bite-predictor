# Indiana Fish Bite Predictor

An interactive web application that predicts fish biting activity for Indiana game fish species based on real-time weather conditions.

## Features

- **9 Indiana Game Fish Species**: Select from Largemouth Bass, Smallmouth Bass, Crappie, Bluegill, Catfish, Walleye, Northern Pike, Muskie, and Yellow Perch
- **Real-time Weather Data**: Fetches current weather conditions based on your location including:
  - Air temperature
  - Estimated water temperature
  - Barometric pressure and trends
  - Wind speed
  - Precipitation
  - Cloud cover
- **Intelligent Prediction Algorithm**: Analyzes weather conditions against species-specific preferences to predict biting activity
- **Visual Feedback**: Color-coded predictions (Excellent, Good, Fair, Poor) with detailed factor analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## How It Works

The app uses a scoring system that evaluates multiple weather factors:

### Temperature (35 points)
- Each fish species has optimal and acceptable temperature ranges
- Water temperature is estimated based on air temperature and season

### Barometric Pressure (30 points)
- **Falling pressure**: Best fishing conditions (fish feed actively before storms)
- **Stable pressure**: Moderate fishing conditions
- **Rising pressure**: Fish may be less active

### Wind Speed (15 points)
- 5-15 mph: Ideal (creates surface activity, oxygenates water)
- < 5 mph: Acceptable (calm conditions)
- > 15 mph: Challenging conditions

### Cloud Cover (10 points)
- Species-specific preferences (some prefer overcast, others prefer clear skies)

### Precipitation (10 points)
- Light rain: Can trigger feeding activity
- Heavy rain: May reduce success
- No rain: Neutral to positive

## Usage

1. Open `index.html` in a web browser
2. Click "Get My Location & Weather" to fetch current conditions
3. Select your target fish species
4. View the bite prediction and detailed condition analysis

## Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with gradients, flexbox, and grid
- **JavaScript (ES6+)**: Application logic and API integration
- **Open-Meteo API**: Free weather data (no API key required)
- **Geolocation API**: Browser-based location detection
- **BigDataCloud API**: Reverse geocoding for location names

## Browser Requirements

- Modern browser with JavaScript enabled
- Geolocation permissions (will be requested when needed)
- Internet connection for weather data

## Species Information

### Largemouth Bass
- Optimal Water Temp: 60-75°F
- Prefers overcast conditions
- High activity level

### Smallmouth Bass
- Optimal Water Temp: 55-70°F
- Prefers clear skies
- High activity level

### Crappie
- Optimal Water Temp: 55-70°F
- Prefers overcast conditions
- Medium activity level

### Bluegill
- Optimal Water Temp: 65-80°F
- Prefers clear skies
- High activity level

### Catfish
- Optimal Water Temp: 70-85°F
- Prefers overcast conditions
- Medium activity level

### Walleye
- Optimal Water Temp: 50-65°F
- Prefers overcast conditions
- Medium activity level

### Northern Pike
- Optimal Water Temp: 50-65°F
- Prefers overcast conditions
- High activity level

### Muskie
- Optimal Water Temp: 55-70°F
- Prefers overcast conditions
- Medium activity level

### Yellow Perch
- Optimal Water Temp: 55-68°F
- Prefers overcast conditions
- High activity level

## Limitations

- Water temperature is estimated, not measured directly
- Predictions are based on general fishing knowledge and may vary by location
- Local factors (moon phase, time of day, specific water conditions) are not considered
- Requires internet connection to fetch weather data

## Future Enhancements

- Add time of day considerations (dawn/dusk bonus)
- Include moon phase data
- Save favorite locations
- Historical bite data tracking
- Offline mode with cached data
- Additional fish species

## License

This project is open source and available for personal and educational use.

## Credits

- Weather data: [Open-Meteo API](https://open-meteo.com/)
- Geocoding: [BigDataCloud](https://www.bigdatacloud.com/)
