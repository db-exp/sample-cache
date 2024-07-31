import express from 'express';
import fetch from 'node-fetch';
import { createClient } from 'redis';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();


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
    let countries = null;
    try {
      // try to get the data from the cache
      countries = await client.get('countries');
    } catch (err) {
      console.log(err);
    }

    // if data from cache is empty then get data from store
    if (countries == null) {
      countries = await getCountries();
      await client.set('countries', JSON.stringify(countries));
    }

    res.status(200).send(JSON.stringify(countries));
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});