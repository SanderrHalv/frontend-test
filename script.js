document.addEventListener('DOMContentLoaded', () => {
    const citiesContainer = document.getElementById('cities-container');
    const refreshButton = document.getElementById('refresh-cities');

    const url = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=3';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'ee1a4ec546mshffc3c5c44fed047p1456c8jsn7ee55e476963',
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    let isFetching = false;

    async function fetchCities() {
        if (isFetching) return;
    
        try {
            isFetching = true;
            console.log('Fetching cities...');
    
            // Generate a random offset, adjust the range based on the total number of cities
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
    
            if (error.message.includes('429')) {
                alert('You are making too many requests. Please wait a moment and try again.');
            }
        } finally {
            isFetching = false;
        }
    }

    function displayCities(cities) {
        citiesContainer.innerHTML = '';
    
        cities.forEach(city => {
            const cityDiv = document.createElement('div');
            cityDiv.className = 'city';
            cityDiv.textContent = city.name;
    
            // Add event listener to highlight the selected city
            cityDiv.addEventListener('click', () => {
                // Remove highlight class from any previously selected city
                const highlightedCity = document.querySelector('.highlight');
                if (highlightedCity) {
                    highlightedCity.classList.remove('highlight');
                }
    
                // Add highlight class to the clicked city
                cityDiv.classList.add('highlight');
            });
    
            citiesContainer.appendChild(cityDiv);
        });
    }
    

    refreshButton.addEventListener('click', fetchCities);

    fetchCities();

    //result displayment

    const form = document.querySelector('form');
    const resultsContainer = document.querySelector('#results')

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const obj = Object.fromEntries(fd);
        console.log(obj);

        displayResults(obj);
    });

    function displayResults(data) {
        resultsContainer.innerHTML = `<h2>Results</h2>
        <p><strong>Your guess:</strong> ${data['user guess']} ${data['unit']}</p>`;
    }
});


