const lat = 37.2707;   // Williamsburg, VA (23188)
const lon = -76.7075;

async function loadWeather() {
  try {
    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const pointData = await pointRes.json();

    const forecastUrl = pointData.properties.forecast;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    const currentObsUrl = pointData.properties.observationStations;
    const stationRes = await fetch(currentObsUrl);
    const stationData = await stationRes.json();

    const stations = stationData.features;
    if (!stations || stations.length === 0) throw new Error("No stations found");

    const stationId = stations[0].properties.stationIdentifier;

    const obsRes = await fetch(`https://api.weather.gov/stations/${station}/observations/latest`);
    const obsData = await obsRes.json();

    renderConditions(obsData);
    renderForecast(forecastData);

    document.getElementById("updated").textContent =
      new Date().toLocaleTimeString();

  } catch (err) {
    console.error(err);
    document.getElementById("conditions").innerText = "⚠️ Weather data temporarily unavailable";
  }
}

function renderConditions(data) {
  const p = data.properties;

  const temp = p.temperature?.value
    ? Math.round(p.temperature.value * 9/5 + 32) + "°F"
    : "N/A";

  const wind = p.windSpeed?.value
    ? p.windSpeed.value + " mph"
    : "N/A";

  document.getElementById("conditions").innerHTML = `
    <div>Temp: ${temp}</div>
    <div>Wind: ${wind}</div>
    <div>Text: ${p.textDescription || "N/A"}</div>
  `;
}

function renderForecast(data) {
  const periods = data.properties.periods.slice(0, 3);

  document.getElementById("forecast").innerHTML = periods.map(p => `
    <div style="margin-bottom:8px;">
      <strong>${p.name}</strong><br/>
      ${p.shortForecast}<br/>
      ${p.temperature}°${p.temperatureUnit}
    </div>
  `).join("");
}

function loadAlerts() {
  fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`)
    .then(r => r.json())
    .then(data => {
      if (!data.features.length) {
        document.getElementById("alerts").innerHTML = "No active alerts";
        return;
      }

      document.getElementById("alerts").innerHTML =
        data.features.map(a => `<div>${a.properties.headline}</div>`).join("");
    });
}

loadWeather();
loadAlerts();
setInterval(loadWeather, 300000); // refresh every 5 min
