const apiKey = `6d4583b38bf508872f5269a383fbbe76`;

// Select elements
const cityElement = document.querySelector(".city");
const temperature = document.querySelector(".temp");
const windSpeed = document.querySelector(".wind-speed");
const humidity = document.querySelector(".humidity");
const visibility = document.querySelector(".visibility-distance");
const descriptionText = document.querySelector(".description-text");
const date = document.querySelector(".date");
const descriptionIcon = document.querySelector(".description i");

// Fetch weather data (by city or coordinates)
async function fetchWeatherData(cityOrCoords) {
  let url;
  if (typeof cityOrCoords === "string") {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&units=metric&appid=${apiKey}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&units=metric&appid=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to fetch weather data");
    const data = await response.json();
    updateWeatherUI(data);
  } catch (error) {
    console.error(error);
  }
}

// Update UI with weather data
function updateWeatherUI(data) {
  cityElement.textContent = data.name;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  windSpeed.textContent = `${data.wind.speed} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  descriptionText.textContent = data.weather[0].description;

  const currentDate = new Date();
  date.textContent = currentDate.toDateString();

  const weatherIconName = getWeatherIconName(data.weather[0].main);
  descriptionIcon.innerHTML = `<i class="material-icons">${weatherIconName}</i>`;
}

// Match weather condition to icon
function getWeatherIconName(condition) {
  const icons = {
    Clear: "wb_sunny",
    Clouds: "cloud",
    Rain: "umbrella",
    Thunderstorm: "flash_on",
    Drizzle: "grain",
    Snow: "ac_unit",
    Mist: "cloud",
    Smoke: "cloud",
    Haze: "cloud",
    Fog: "cloud",
  };
  return icons[condition] || "help";
}

// Handle form submit for city search
const formElement = document.querySelector(".search-form");
const inputElement = document.querySelector(".city-input");

formElement.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = inputElement.value.trim();
  if (city !== "") {
    fetchWeatherData(city);
    inputElement.value = "";
  }
});

// On load: try GPS, fallback to IP, then to Karachi
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        fetchWeatherData(coords);
      },
      async () => {
        console.warn("GPS denied, using IP location...");
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          const ipData = await ipRes.json();
          fetchWeatherData({ lat: ipData.latitude, lon: ipData.longitude });
        } catch (e) {
          console.error("IP location fetch failed. Using default city.");
          fetchWeatherData("Karachi");
        }
      }
    );
  } else {
    fetchWeatherData("Karachi");
  }
};
