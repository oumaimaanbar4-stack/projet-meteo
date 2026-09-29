const main = document.querySelector("#main");
const searchInput = document.querySelector("#searchInput");
const searchForm = document.querySelector("#searchForm");
const erreur = document.querySelector(".error");

const appid = "24face4693e4a6b6cc99c744358f9677";

const cities = [];
const coords = {};

async function fetchWeatherData(cityName, coords) {
  let requestUrl = "";
  if (!cityName) {
    requestUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords?.lat}&lon=${coords?.lon}&units=metric&appid=${appid}`;
  } else if (cityName !== "") {
    requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${appid}`;
  }

  const response = await fetch(requestUrl);
  // convertir le json en objet JS
  const data = await response.json();
  if (data.cod === "404") {
    erreur.innerHTML = `<small>${data.message}</small>`;
  } else if (data.cod === 200) {
    erreur.innerHTML = "";
    // verifier est ce la ville est deja presente dans le tableau cities
    const city = cities.find((city) => city.id === data.id);
    if (!city) {
      // ajouter un objet ville {id: , name: } dans le tableau cities
      cities.push({ id: data.id, name: data.name });
      // 1 creer le markup html de la carte
      createCardMarkup(data.id);
    }
    // remplir les donnees du markup = mise a jour des donnees
    setCardData(data.id, data);
  }
}

searchForm.onsubmit = function (e) {
  // empecher l'envoie du formulaire
  // pour ne pas actualiser la page html
  e.preventDefault();
  const city = searchInput.value.trim();
  // appeler l'api avec le nom de la ville
  fetchWeatherData(city);
  // vider le champ
  searchInput.value = "";
};

function setCardData(id, data) {
  // chercher dans le DOM l'element ayant le id de la carte
  const card = document.getElementById(id);
  card.querySelector(".city").innerHTML = data.name;
  card.querySelector(".country").innerHTML = data.sys.country;
  card.querySelector(".temp").innerHTML =
    Math.round(data.main.feels_like) + "°C";
  card.querySelector(".temp-min").innerHTML = Math.floor(data.main.temp_min);
  card.querySelector(".temp-max").innerHTML = Math.ceil(data.main.temp_max);
  card.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  card.querySelector(".wind-speed").innerHTML = data.wind.speed + "m/s";
  card.querySelector(
    ".wind-direction"
  ).style.transform = `rotate(${data.wind.deg}deg)`;
  card.querySelector(".description").innerHTML = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  card.querySelector(".icon").src = iconUrl;
  const sunrise = new Date((data.sys.sunrise + data.timezone) * 1000);
  const sunset = new Date((data.sys.sunset + data.timezone) * 1000);
  card.querySelector(".sunrise").innerHTML = sunrise
    .toUTCString()
    .slice(17, 22);
  card.querySelector(".sunset").innerHTML = sunset.toUTCString().slice(17, 22);

  const refreshBtn = card.querySelector(".refresh-btn");
  refreshBtn.onclick = function () {
    fetchWeatherData(data.name);
    console.log("updated");
  };
}

function createCardMarkup(id) {
  const card = `<div id='${id}' class="card rounded-4 ps-4 pe-3 py-5 position-relative">
        <span class="position-absolute top-0 end-0 m-3 fs-4 fw-bold"
          ><i class="refresh-btn fa-solid fa-arrows-rotate text-primary"></i
        ></span>
        <h4 style="width:fit-content" class="position-relative">
          <span class="city">
          </span>
           <span class="country fs-6 position-absolute top-0 start-100 translate-middle rounded-circle p-1 ms-2 text-bg-primary"
            </span>
        </h4>
        <div class="d-flex align-items-center mb-3 gap-3">
          <h1 class="temp m-0 fw-bold" style="font-size: 2.8rem"></h1>
          <div class="d-flex align-items-center gap-2">
            <div class="d-flex flex-column align-items-center">
              <h5 class="temp-max m-0 text-danger"></h5>
              <h5 class="temp-min m-0 text-info"></h5>
            </div>
            <h5 class="humidity m-0"></h5>
          </div>
        </div>
        <div class="d-flex align-items-center mb-3 gap-1">
          <h1 class="m-0">
            <img class="icon" src="" alt="" />
          </h1>
          <div>
            <h5 class="m-0">
              <i class="fs-4 bi bi-brightness-high-fill text-warning"></i>
              <span class="sunrise"></span>
            </h5>
            <h5 class="m-0">
              <i class="fs-4 bi bi-brightness-alt-high-fill text-danger"></i>
              <span class="sunset"></span>
            </h5>
            <h5 class="m-0">
              <i class="fs-4 bi bi-wind text-secondary"></i>
             <span class="wind-speed"></span>

              <!-- direction icon -->
              <svg
              class="wind-direction"
                fill="#dc3545"
                width="25px"
                version="1.1"
              
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox=".72 -686.72 2365.44 2365.44"
                xml:space="preserve"
                stroke="#dc3545"
                stroke-width="0.01792"
              >
                <g stroke-width="0"></g>
                <g
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke="#CCCCCC"
                  stroke-width="21.503999999999998"
                ></g>
                <g>
                  <path
                    d="M103,703.4L1683,125L1104.6,1705L867.9,940.1L103,703.4z"
                  ></path>
                </g>
              </svg>
            
            </h5>
          </div>
        </div>
        <h4 class="description"></h4>
      </div>`;
  main.innerHTML += card;
}

// faire la mise a jour de toutes les villes

// programmer cette mise a jour apres chaque 15min
// 15min = 15 * 60 * 1000 ms = 900000 ms
setInterval(() => {
  if (cities.length !== 0) {
    cities.forEach((city) => {
      fetchWeatherData(city.name);
    });
  }
}, 900000);

getLocation();

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function success(position) {
  coords.lat = position.coords.latitude;

  coords.lon = position.coords.longitude;
  fetchWeatherData("", coords);
}

function error() {
  alert("Sorry, no position available.");
}
