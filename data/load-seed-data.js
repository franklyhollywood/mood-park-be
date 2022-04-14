const bcrypt = require('bcryptjs');
const client = require('../lib/client');
// import our seed data:
const favorite = require('./favorite.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
run();
const comments = require('./comments.js');

async function run() {
	try {
		await client.connect();

		const users = await Promise.all(
			usersData.map((user) => {
				const hash = bcrypt.hashSync(user.password, 8);
				return client.query(
					`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
					[user.email, hash]
				);
			})
		);

		const user = users[0].rows[0];

		await Promise.all(
			favorite.map((fav) => {
				return client.query(
					`
                    INSERT INTO favorites (url, fullName, states, parkCode, description, images, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
					[
						fav.url,
						fav.fullName,
						fav.states,
						fav.parkCode,
						fav.description,
						fav.images,
						user.id,
					]
				);
			})
		);

		await Promise.all(
			comments.map((comment) => {
				return client.query(
					`
                    INSERT INTO comments (comment, parkcode, owner_id, park_timestamp, rating)
                    VALUES ($1, $2, $3, $4, $5);
                `,
					[
						comment.comment,
						comment.parkcode,
						user.id,
						Date.now(),
						comment.rating,
					]
				);
			})
		);

		console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
	} catch (err) {
		console.log(err);
	} finally {
		client.end();
	}
}

//comment
