const express = require('express');
const fetch = require('node-fetch'); 
const app = express();
const PORT = process.env.PORT || 3000;



app.get('/sort', async (req, res) => {
  try {

    const apiListResponse = await fetch('https://raw.githubusercontent.com/Minotaur-ZAOU/test/refs/heads/main/min-tube-api.json');
    if (!apiListResponse.ok) {
      throw new Error(`Failed to fetch API list: ${apiListResponse.statusText}`);
    }
    const apiList = await apiListResponse.json();


    const healthChecks = await Promise.all(
      apiList.map(async (baseUrl) => {
        try {

          const statusUrl = baseUrl.endsWith('/') ? `${baseUrl}status` : `${baseUrl}/status`;
          const response = await fetch(statusUrl);
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          const statusJson = await response.json();


          const healthStr = statusJson.health;
          const match = healthStr.match(/\((\d+)%\)/);
          const healthValue = match ? parseInt(match[1], 10) : 0;
          return {
            url: baseUrl,
            health: statusJson.health,
            healthValue: healthValue,
            statusData: statusJson
          };
        } catch (error) {

          return {
            url: baseUrl,
            health: "Unavailable (0%)",
            healthValue: 0,
            error: error.message
          };
        }
      })
    );

    
    healthChecks.sort((a, b) => b.healthValue - a.healthValue);
    res.json(healthChecks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/check', async (req, res) => {
  
  const endpoints = [
    "https://min-api-2.glitch.me",
    "https://min-tube-api-3.vercel.app",
    "https://min-tube-api4.vercel.app",
    "https://server-min2-ok-6.glitch.me",
    "https://min-tube-api5.vercel.app"
  ];

  try {
   
    const results = await Promise.all(
      endpoints.map(async (url) => {
        try {
          
          const statusUrl = url.endsWith('/') ? `${url}status` : `${url}/status`;
          const response = await fetch(statusUrl);
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          const json = await response.json();


          const match = json.health.match(/\((\d+)%\)/);
          const healthValue = match ? parseInt(match[1], 10) : 0;
          return { url, healthValue };
        } catch (error) {

          return { url, healthValue: 0 };
        }
      })
    );


    results.sort((a, b) => b.healthValue - a.healthValue);


    const sortedUrls = results.map(item => item.url);


    res.json(sortedUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/', (req, res) => {
  res.send("Oops.nothing");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});