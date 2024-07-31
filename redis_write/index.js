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
      countries = await client.get('data');
    } catch (err) {
      console.log(err);
    }

    res.status(200).send(JSON.stringify(countries));
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

setInterval(async () => {
  console.log('Running a scheduled task');
  let countries = await getCountries();
  updateData('data', JSON.stringify(countries));
}, 2000); //every 2 seconds

// Define a function to update data, prioritizing cache updates and deferring data store updates asynchronously
async function updateData(key, newData) {
  // Initiate cache update
  await client.set(key, JSON.stringify(newData));
  console.log('cache updated');
}

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});