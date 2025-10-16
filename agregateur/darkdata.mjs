app.get('/darkdata/deeplocation', async (req, res) => {
  const data = await getPipeline();
  const location = data.utilisateur.pays;
  let zone = "Non européenne";
  if(["France", "Belgium", "Switzerland"].includes(location)) zone = "Europe francophone";
  res.json({pays: location, zone});
});

app.get('/darkdata/email_domain', async (req, res) => {
  const data = await getPipeline();
  const domain = data.utilisateur.email.split("@")[1];
  res.json({email: data.utilisateur.email, domaine: domain});
});

app.get('/darkdata/iban_valid', async (req, res) => {
  const data = await getPipeline();
  const iban = typeof data.iban === "string" ? data.iban : (Array.isArray(data.iban) ? data.iban[0] : "");
  const valid = /^FR\d{12,}/.test(iban);
  res.json({iban, valid});
});

app.get('/darkdata/joke_length', async (req, res) => {
  const data = await getPipeline();
  const count = (data.blague.match(/\w+/g) || []).length;
  res.json({blague: data.blague, word_count: count});
});
