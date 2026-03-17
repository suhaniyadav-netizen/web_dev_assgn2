const API_KEY = "0133cc5316757ac730cc46ae342334e4";

const form = document.querySelector("#form");
const cityInput = document.querySelector("#city");
const weatherContent = document.querySelector("#weatherContent");
const searchHistory = document.querySelector(".historyBtn");
const consoleBox = document.querySelector("#consoleBox");

let cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];

// safety check: make sure cityHistory is always an array
if (!Array.isArray(cityHistory)) {
    cityHistory = [];
    localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const searchCity = cityInput.value.trim();

    if (!searchCity) return;

    consoleBox.innerHTML = "";
    logMessage("[SYNC] Start");
    logMessage("[ASYNC] Start fetching");

    await getdata(searchCity);

    cityInput.value = "";
});

async function getdata(searchCity) {
    if (!searchCity) return;

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`
        );

        const data = await res.json();

        logMessage("[PROMISE] then (Microtask)");

        if (data.cod == 200) {
            weatherContent.innerHTML = `
                <p><span>City</span><span>${data.name}, ${data.sys.country}</span></p>
                <p><span>Temp</span><span>${(data.main.temp - 273.15).toFixed(1)} °C</span></p>
                <p><span>Weather</span><span>${data.weather[0].main}</span></p>
                <p><span>Humidity</span><span>${data.main.humidity}%</span></p>
                <p><span>Wind</span><span>${data.wind.speed} m/s</span></p>
            `;

            if (!cityHistory.includes(searchCity)) {
                cityHistory.push(searchCity);
                localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
            }

            displayHistory();
            logMessage("[ASYNC] Data received");
            logMessage("[ASYNC] DOM updated");
        } else {
            weatherContent.innerHTML = `
                <p><span>Status</span><span>City not found</span></p>
            `;
            logMessage("[ERROR] City not found");
        }
    } catch (error) {
        weatherContent.innerHTML = `
            <p><span>Status</span><span>Something went wrong</span></p>
        `;
        logMessage("[ERROR] Failed to fetch data");
        console.error(error);
    }
}

function displayHistory() {
    searchHistory.innerHTML = "";

    // extra safety check
    if (!Array.isArray(cityHistory)) {
        cityHistory = [];
    }

    cityHistory.forEach((city) => {
        const btn = document.createElement("button");
        btn.innerText = city;

        btn.addEventListener("click", function () {
            consoleBox.innerHTML = "";
            logMessage(`[HISTORY] Fetching ${city}`);
            getdata(city);
        });

        searchHistory.appendChild(btn);
    });
}

function logMessage(message) {
    consoleBox.innerHTML += `${message}<br>`;
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

displayHistory();