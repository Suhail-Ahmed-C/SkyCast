 const API_KEY = '6bbc5926cece432391004627262002';
    let tempChart;
    let tempUnit = 'C';

    document.addEventListener('DOMContentLoaded', () => {
        initChart();
        searchCity('London');
        updateTime();
        setInterval(updateTime, 1000);
    });

    function updateTime() {
        const now = new Date();
        document.getElementById('datetime').innerText = now.toLocaleString('en-US', { 
            weekday: 'long', hour: '2-digit', minute: '2-digit'
        });
    }

    // Helper for temperature conversion
    function formatTemp(tempC) {
        return tempUnit === 'C' ? Math.round(tempC) + '°C' : Math.round((tempC * 9/5) + 32) + '°F';
    }

    async function searchCity(cityInput) {
        const city = cityInput || document.getElementById('cityInput').value;
        if (!city) return;

        try {
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no`);
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();

            // Update UI
            document.getElementById('cityName').innerText = data.location.name;
            document.getElementById('countryName').innerText = data.location.country;
            document.getElementById('temperature').innerText = formatTemp(data.current.temp_c);
            document.getElementById('weatherDescription').innerText = data.current.condition.text;
            document.getElementById('weatherIconMain').innerHTML = `<img src="https:${data.current.condition.icon}" width="100">`;

            document.getElementById('humidity').innerText = data.current.humidity + '%';
            document.getElementById('windSpeed').innerText = data.current.wind_kph + ' km/h';
            document.getElementById('pressure').innerText = data.current.pressure_mb + ' hPa';
            document.getElementById('visibility').innerText = data.current.vis_km + ' km';
            document.getElementById('uvIndex').innerText = data.current.uv;
            document.getElementById('precipitation').innerText = data.forecast.forecastday[0].day.daily_chance_of_rain + '%';
            
            document.getElementById('sunriseTime').innerText = data.forecast.forecastday[0].astro.sunrise;
            document.getElementById('sunsetTime').innerText = data.forecast.forecastday[0].astro.sunset;

            updateHourly(data.forecast.forecastday[0].hour);
            updateWeeklyForecast(data.forecast.forecastday);
            updateChart(data.forecast.forecastday[0].hour);
            setWeatherEffect(data.current.condition.text);
            setWeatherBackground(data.current.condition.text);

        } catch (error) {
            alert("Error: City not found!");
        }
    }

    function updateHourly(hours) {
        const container = document.getElementById('hourlyScroll');
        container.innerHTML = '';
        hours.slice(0, 12).forEach(hour => {
            container.innerHTML += `
                <div class="hourly-card">
                    <div class="small opacity-50">${hour.time.split(' ')[1]}</div>
                    <img src="https:${hour.condition.icon}" width="40">
                    <div class="fw-bold">${formatTemp(hour.temp_c)}</div>
                </div>`;
        });
    }

    function updateWeeklyForecast(days) {
        const container = document.getElementById('weeklyForecast');
        container.innerHTML = '';
        days.forEach((day, index) => {
            const date = new Date(day.date);
            const name = date.toLocaleDateString('en-US', { weekday: 'short' });
            container.innerHTML += `
                <div class="week-card">
                    <h6>${index === 0 ? 'Today' : name}</h6>
                    <img src="https:${day.day.condition.icon}" width="45">
                    <div class="fw-bold mt-1">${Math.round(day.day.maxtemp_c)}°</div>
                    <span class="small opacity-50">${Math.round(day.day.mintemp_c)}°</span>
                </div>`;
        });
    }

    function initChart() {
        const ctx = document.getElementById('tempChart').getContext('2d');
        tempChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ data: [], borderColor: '#00f0ff', tension: 0.4, fill: true, backgroundColor: 'rgba(0, 240, 255, 0.1)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } } }
        });
    }

    function updateChart(hours) {
        const step = 3;
        tempChart.data.labels = hours.filter((_, i) => i % step === 0).map(h => h.time.split(' ')[1]);
        tempChart.data.datasets[0].data = hours.filter((_, i) => i % step === 0).map(h => Math.round(h.temp_c));
        tempChart.update();
    }

    function setWeatherEffect(type) {
        const bg = document.getElementById('weather-bg');
        bg.innerHTML = '';
        type = type.toLowerCase();
        if (type.includes('rain')) {
            for(let i=0; i<80; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + 'vw';
                drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
                bg.appendChild(drop);
            }
        }
    }

    function setWeatherBackground(condition) {
    document.body.className = '';
    condition = condition.toLowerCase();

    if (condition.includes('sun') || condition.includes('clear')) {
        document.body.classList.add('sunny');
    } 
    else if (condition.includes('cloud')) {
        document.body.classList.add('cloudy');
    } 
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        document.body.classList.add('rainy');
    } 
    else if (condition.includes('snow')) {
        document.body.classList.add('snowy');
    } 
    else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
        document.body.classList.add('foggy');
    } 
    else {
        document.body.classList.add('night');
    }
}