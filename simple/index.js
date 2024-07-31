import express from 'express';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

// stdTTL is the default time-to-live for each cache entry
const cache = new NodeCache({ stdTTL: 300 });

// retrieve data
async function getCountries() {
  const response = await fetch(`https://restcountries.com/v3.1/all?fields=name,flags`);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}

const app = express(); 
app.get('/countries', async (req, res) => {
  try {
    // try to get the countries from cache
    let countries = cache.get('allCountries');

    // if data from cache is empty then get data from store
    if (countries == null) {
      countries = await getCountries();
      // time-to-live is set to 300 seconds. 
      cache.set('allCountries', countries, 300);
    }

    res.status(200).send(countries);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});