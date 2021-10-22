require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {


    let token;

    beforeAll(async () => {
      execSync('npm run setup-db');

      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line
    }, 10000);

    afterAll(done => {
      return client.end(done);
    });

    test('returns all parks', async () => {

      const expectation =
      {
        id: expect.any(String),
        url: expect.any(String),
        fullName: expect.any(String),
        parkCode: expect.any(String),
        description: expect.any(String),
        latitude: expect.any(String),
        longitude: expect.any(String),
        name: expect.any(String),
        latLong: expect.any(String),
        activities: expect.any(Array),
        topics: expect.any(Array),
        states: expect.any(String),
        contacts: expect.any(Object),
        entranceFees: expect.any(Array),
        entrancePasses: expect.any(Array),
        fees: expect.any(Array),
        directionsInfo: expect.any(String),
        directionsUrl: expect.any(String),
        operatingHours: expect.any(Array),
        addresses: expect.any(Array),
        images: expect.any(Array),
        weatherInfo: expect.any(String),
        designation: expect.any(String)
      };


      const data = await fakeRequest(app)

        .get('/parks?start=0')
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body.data[0]).toEqual(expectation);
    });

    test('returns one park', async () => {

      const expectation =
      {
        id: expect.any(String),
        url: expect.any(String),
        fullName: expect.any(String),
        parkCode: expect.any(String),
        description: expect.any(String),
        latitude: expect.any(String),
        longitude: expect.any(String),
        name: expect.any(String),
        latLong: expect.any(String),
        activities: expect.any(Array),
        topics: expect.any(Array),
        states: expect.any(String),
        contacts: expect.any(Object),
        entranceFees: expect.any(Array),
        entrancePasses: expect.any(Array),
        fees: expect.any(Array),
        directionsInfo: expect.any(String),
        directionsUrl: expect.any(String),
        operatingHours: expect.any(Array),
        addresses: expect.any(Array),
        images: expect.any(Array),
        weatherInfo: expect.any(String),
        designation: expect.any(String)
      };


      const data = await fakeRequest(app)

        .get('/park?q=alcatraz')
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body.data[0]).toEqual(expectation);
    });

    test('details by park code', async () => {

      const expectation =
      {
        id: expect.any(String),
        url: expect.any(String),
        fullName: expect.any(String),
        parkCode: expect.any(String),
        description: expect.any(String),
        latitude: expect.any(String),
        longitude: expect.any(String),
        name: expect.any(String),
        latLong: expect.any(String),
        activities: expect.any(Array),
        topics: expect.any(Array),
        states: expect.any(String),
        contacts: expect.any(Object),
        entranceFees: expect.any(Array),
        entrancePasses: expect.any(Array),
        fees: expect.any(Array),
        directionsInfo: expect.any(String),
        directionsUrl: expect.any(String),
        operatingHours: expect.any(Array),
        addresses: expect.any(Array),
        images: expect.any(Array),
        weatherInfo: expect.any(String),
        designation: expect.any(String)
      };


      const data = await fakeRequest(app)

        .get('/parkDetail/abli')
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body.data[0]).toEqual(expectation);
    });

    test('adds a favorite park', async () => {

      const expectation =
      {
        id: expect.any(Number),
        url: 'abli',
        fullname: 'abe lincoln',
        states: 'va',
        parkcode: 'abli',
        description: 'abe lincoln birthplace',
        images: expect.any(String),
        owner_id: expect.any(Number)
      };


      const data = await fakeRequest(app)

        .post('/api/favorites')
        .send({
          url: 'abli',
          fullName: 'abe lincoln',
          states: 'va',
          parkCode: 'abli',
          description: 'abe lincoln birthplace',
          images: [{ url: 'anything ' }],
        })
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('gets all favorite parks', async () => {

      const expectation = [
        {
          id: expect.any(Number),
          url: expect.any(String),
          fullname: expect.any(String),
          states: expect.any(String),
          parkcode: expect.any(String),
          description: expect.any(String),
          images: expect.any(String),
          owner_id: expect.any(Number)
        }
      ];


      const data = await fakeRequest(app)

        .get('/api/favorites')
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });


    test('deletes favorite parks', async () => {

      const expectation = [
        {
          id: expect.any(Number),
          url: expect.any(String),
          fullname: expect.any(String),
          states: expect.any(String),
          parkcode: expect.any(String),
          description: expect.any(String),
          images: expect.any(String),
          owner_id: expect.any(Number)
        }
      ];


      const data = await fakeRequest(app)

        .delete('/api/favorites/abli')
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('adds comment', async () => {

      const expectation =
      {
        id: expect.any(Number),
        comment: expect.any(String),
        parkcode: expect.any(String),
        owner_id: expect.any(Number),
        park_timestamp: expect.any(String)
      };



      const data = await fakeRequest(app)

        .post('/api/comments')
        .send({
          comment: expect.any(String),
          parkcode: expect.any(String),
          owner_id: expect.any(Number)
        })
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('gets comment', async () => {

      const expectation = [
        {
          id: expect.any(Number),
          comment: expect.any(String),
          owner_id: expect.any(Number),
          park_timestamp: expect.any(String),
          parkcode: expect.any(String)

        }
      ];


      const data = await fakeRequest(app)

        .get('/api/comments/abli')
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('edits comment', async () => {

      const expectation = [

      ];


      const data = await fakeRequest(app)

        .put('/api/comments/1')
        .send({
          comment: expect.any(String),


        })
        .set('Authorization', token)
        .set({ accept: 'application/json' })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });





  });
});

//test completed
