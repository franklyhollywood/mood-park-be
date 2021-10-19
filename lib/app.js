const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route.
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/park', async (req, res) => {
  try {
    const park = req.query.q;
    const response = await request.get(`https://developer.nps.gov/api/v1/parks?q=${park}&api_key=${process.env.PARKS_KEY}`)
      .set({ accept: 'application/json' });

    res.json(response.body);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/parks', async (req, res) => {
  try {
    // const park = req.query;
    const response = await request.get(`https://developer.nps.gov/api/v1/parks?limit=20&api_key=${process.env.PARKS_KEY}`)
      .set({ accept: 'application/json' });

    res.json(response.body);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/parkDetail/:parkCode', async (req, res) => {
  try {

    const parkCode = req.params.parkCode;
    const response = await request.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${process.env.PARKS_KEY}`)
      .set({ accept: 'application/json' });

    res.json(response.body);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/api/favorite', async (req, res) => {
  try {
    const data = await client.query(`INSERT into favorites (url, fullName, states, parkCode, description, activities, entranceFees, operatingHours, images, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`, [req.body.url, req.body.fullName, req.body.states, req.body.parkCode, req.body.description, req.body.activities, req.body.entranceFees, req.body.operatingHours, req.body.images, req.userId]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/favorites', async (req, res) => {
  try {
    const data = await client.query(`SELECT * from favorites

    WHERE owner_id = $1`, [req.userId]);


    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
