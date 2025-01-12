document.addEventListener('DOMContentLoaded', () => {
    const citiesContainer = document.querySelector('#cities-container');
    const refreshButton = document.querySelector('#refresh-cities');
    const form = document.querySelector('form');
    const resultsContainer = document.querySelector('#results');
    const countdownTimer = document.querySelector('#countdown');
    const weatherUrl = "https://api.open-meteo.com/v1/forecast";
    const url = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=3';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'ee1a4ec546mshffc3c5c44fed047p1456c8jsn7ee55e476963',
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    let isFetching = false;
    let currentTemp = null;
    let currentCity = null;
    let guessHistory = null;


    async function fetchCities() {
        if (isFetching) return;

        try {
            isFetching = true;
            console.log('Fetching cities...');

            // Generate a random offset to fetch different cities on each request
            const randomOffset = Math.floor(Math.random() * 1000);

            const response = await fetch(`${url}&offset=${randomOffset}`, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched cities:', data);

            displayCities(data.data);
        } catch (error) {
            console.error('Error fetching cities:', error);

            // Handle rate limit error is error number 429
            if (error.message.includes('429')) {
                alert('You are making too many requests. Please wait a moment and try again.');
            }
        } finally {
            isFetching = false;
        }
    }

    function displayCities(cities) {
        citiesContainer.innerHTML = '';

        cities.forEach(async (city) => {
            const cityDiv = document.createElement('div');
            cityDiv.className = 'city';
            cityDiv.textContent = city.name;

            // Highlight selected city and remove highlight from previously selected one
            cityDiv.addEventListener('click', async() => {
                const highlightedCity = document.querySelector('.highlight');
                if (highlightedCity) {
                    highlightedCity.classList.remove('highlight');
                }
                cityDiv.classList.add('highlight');

                // AW
                let currentLat = city.latitude;
                let currentLong = city.longitude;
                const test = await fetch(
                `${weatherUrl}?latitude=${currentLat}&longitude=${currentLong}&current=temperature_2m`
                );
                const data = await test.json();
                console.log(data);
                console.log(
                "Current city: " +
                    city.name +
                    ", current temp: " +
                    parseInt(data.current.temperature_2m)
                );
                currentTemp = parseInt(data.current.temperature_2m);
                currentCity = city.name;

            });

            citiesContainer.appendChild(cityDiv);
        });
    }

    //local storage functions

    function loadStorage() {
        console.log("Loading from storage");
        guessHistory = localStorage.getItem("guessGame");
        if (guessHistory) {
          console.log("Got history: ", guessHistory);
          resultsContainer.innerHTML = guessHistory;
        } else {
          console.log("No history found");
        }
      }
    
      function saveStorage(guess) {
        console.log(guess);
        console.log("Saving to storage");
        localStorage.setItem("guessGame", guess);
        console.log("Saved");
      }
    
      function clearStorage() {
        localStorage.clear("guessGame");
        console.log("Cleared storage");
      }

    //triggers fetchcities function when refreshbutton is clicked
    refreshButton.addEventListener('click', fetchCities);
    refreshButton.addEventListener("click", clearStorage);

    fetchCities();

    loadStorage();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const obj = Object.fromEntries(fd);
        console.log(obj);

        displayResults(obj);
        fetchCities();
    });

    function checkScore(guess, current, isFahrenheit) {
        if (isFahrenheit) {
          console.log("Converting to to celsius");
          const old = guess;
          guess = (guess - 32) / 1.8;
          console.log(old + " -> " + guess);
        }
        console.log(parseInt(guess), parseInt(current));
        if (Math.abs(parseInt(current) - parseInt(guess)) <= 5) {
          return true;
        }
        return false;
      }

    function displayResults(data) {
    // <h2>Results</h2>
        resultsContainer.innerHTML += `            
                <p><strong>City: </strong>${currentCity}</p>
                <p><strong>Your guess: </strong> ${data["user guess"]} ${
                data["unit"]
                }</p>
                <p><strong>Result: </strong>${
                    checkScore(data["user guess"], currentTemp, false)
                    ? " Win"
                    : " Fail"
                }</p>
                <p><strong>Actual temp: </strong>${currentTemp}</p>
                <br></br>            
            `;
        saveStorage(resultsContainer.innerHTML);
    }
    

    function startCountdown() {
        let timeLeft = 7;

        countdownTimer = setInterval (() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
                displayResults({message: 'Time is up! you lost'});
                countdownTimer.innerHTML = `<p> Time is up! You lost`;
            } else {
                countdownTimer.innerHTML = `<p> seconds left ${timeLeft}</p>`
            }
        }, 1000);
    }
    
    window.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        event.returnValue = ''; // This triggers the confirmation 
    });
});
