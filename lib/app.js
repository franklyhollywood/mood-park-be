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
		message: `in this proctected route, we get the user's id like so: ${req.userId}`,
	});
});

app.get('/park', async (req, res) => {
	try {
		const park = req.query.q;
		const response = await request
			.get(
				`https://developer.nps.gov/api/v1/parks?q=${park}&api_key=${process.env.PARKS_KEY}`
			)
			.set({ accept: 'application/json' });
		res.json(response.body);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get('/parks', async (req, res) => {
	try {
		console.log('HELLO!!!!');
		const response = await request
			.get(
				`https://developer.nps.gov/api/v1/${
					req.query.activity ? 'activities/' : ''
				}parks?limit=${req.query.limit}&start=${req.query.start}&id=${
					req.query.activity
				}&api_key=${process.env.PARKS_KEY}`
			)
			.set({ accept: 'application/json' });
		res.json(response.body);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get('/parkDetail/:parkCode', async (req, res) => {
	try {
		const parkCode = req.params.parkCode;
		const response = await request
			.get(
				`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${process.env.PARKS_KEY}`
			)
			.set({ accept: 'application/json' });

		res.json(response.body);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.post('/api/favorites', async (req, res) => {
	try {
		const data = await client.query(
			`INSERT into favorites (url, fullName, states, parkCode, description, images, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
			[
				req.body.url,
				req.body.fullName,
				req.body.states,
				req.body.parkCode,
				req.body.description,
				req.body.images[0].url,
				req.userId,
			]
		);

		res.json(data.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get('/api/favorites', async (req, res) => {
	try {
		const data = await client.query(
			`SELECT * from favorites

    WHERE owner_id = $1`,
			[req.userId]
		);

		res.json(data.rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.delete('/api/favorites/:parkCode', async (req, res) => {
	try {
		const data = await client.query(
			`DELETE from favorites

    WHERE owner_id = $1
    AND
    parkCode = $2
    RETURNING *`,
			[req.userId, req.params.parkCode]
		);

		res.json(data.rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.post('/api/comments', async (req, res) => {
	try {
		const data = await client.query(
			`INSERT into comments (comment, parkcode, owner_id, park_timestamp, rating)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
			[
				req.body.comment,
				req.body.parkcode,
				req.userId,
				Date.now(),
				req.body.ratingValue,
			]
		);

		res.json(data.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get('/api/comments/:parkCode', async (req, res) => {
	try {
		const data = await client.query(
			'SELECT comment, owner_id, id, rating FROM comments WHERE parkcode = $1',
			[req.params.parkCode]
		);

		res.json(data.rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.put('/api/comments/:id', async (req, res) => {
	try {
		const data = await client.query(
			`
    UPDATE comments
    SET comment = $1

    WHERE id = $2 
    AND owner_id = $3`,
			[req.body.comment, req.params.id, req.userId]
		);

		res.json(data.rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.delete('/api/comments/:id', async (req, res) => {
	try {
		const data = await client.query('DELETE FROM comments WHERE id =$1', [
			req.params.id,
		]);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/user', async (req, res) => {
	try {
		const data = await client.query('SELECT id FROM users WHERE id = $1', [
			req.userId,
		]);
		console.log(req.userId);

		res.json(data.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.use(require('./middleware/error'));

module.exports = app;
