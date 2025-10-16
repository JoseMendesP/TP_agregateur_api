const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();


async function getPipeline() {
  let profile = {};
  try {
    const [user, phone, iban, card, randomName, joke, advice] = await Promise.all([
      axios.get('https://randomuser.me/api/'),
      axios.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', { headers: { 'X-Api-Key': process.env.RANDOMMER_API_KEY } }),
      axios.get('https://randommer.io/api/Finance/Iban/FR', { headers: { 'X-Api-Key': process.env.RANDOMMER_API_KEY } }),
      axios.get('https://randommer.io/api/Card?type=AmericanExpress', { headers: { 'X-Api-Key': process.env.RANDOMMER_API_KEY } }),
      axios.get('https://randommer.io/api/Name?nameType=fullname&quantity=1', { headers: { 'X-Api-Key': process.env.RANDOMMER_API_KEY } }),
      axios.get('https://official-joke-api.appspot.com/random_joke'),
      axios.get('https://api.adviceslip.com/advice')
    ]);

    const userData = user.data.results[0];
    profile = {
      utilisateur: {
        nom_complet: userData.name.first + ' ' + userData.name.last,
        email: userData.email,
        ville: userData.location.city,
        pays: userData.location.country,
        photo: userData.picture.large
      },
      nom_aleatoire: randomName.data,
      telephone: phone.data,
      iban: iban.data,
      carte_de_credit: card.data,
      blague: joke.data.setup + ' — ' + joke.data.punchline,
      conseil_du_jour: advice.data.slip.advice
    };
  } catch (e) {
    console.log('Erreur pipeline', e.message);
  }
  return profile;
}



// 1. Données brutes agrégées
app.get('/profile', async (req, res) => {
  res.json(await getPipeline());
});

// ----- DARK DATA -----


app.get('/darkdata/iban_valid', async (req, res) => {
  const data = await getPipeline();
  const iban = typeof data.iban === "string" ? data.iban : (Array.isArray(data.iban) ? data.iban[0] : "");
  const valid = /^FR\d{12,}/.test(iban);
  res.json({ iban, valid });
});


app.get('/darkdata/email_domain', async (req, res) => {
  const data = await getPipeline();
  const domain = data.utilisateur.email.split("@")[1];
  res.json({ email: data.utilisateur.email, domaine: domain });
});


app.get('/darkdata/deeplocation', async (req, res) => {
  const data = await getPipeline();
  const location = data.utilisateur.pays;
  let zone = "Non européenne";
  if (["France", "Belgium", "Switzerland"].includes(location)) zone = "Europe francophone";
  res.json({ pays: location, zone });
});


app.get('/darkdata/joke_length', async (req, res) => {
  const data = await getPipeline();
  const count = (data.blague.match(/\w+/g) || []).length;
  res.json({ blague: data.blague, word_count: count });
});


app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
