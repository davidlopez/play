var request = require("supertest");
var app = require('../../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

describe('Test the favorites endpoints', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlist_favorites cascade');
    await database.raw('truncate table playlists cascade');
    await database.raw('truncate table favorites cascade');
  });


  describe('Test getting all playlists', () => {
    it('It should respond with all playlists in db', async () => {
      await database('playlists').insert({title: 'Workout Jams', id: 1});
      await database('playlists').insert({title: 'Sad Playlist', id: 2});

      await database('favorites').insert([{
        id: 1,
        title: 'We Will Rock You',
        artistName: 'Queen',
        genre: 'Rock',
        rating: 88 },
        {
        id: 2,
        title: 'Careless Whisper',
        artistName: 'George Michael',
        genre: 'Classical',
        rating: 93 }]);

      await request(app).post('/api/v1/playlists/1/favorites/1');
      await request(app).post('/api/v1/playlists/1/favorites/2');

      const res = await request(app).get("/api/v1/playlists");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Workout Jams');
      expect(res.body[0].songCount).toBe(2);
      expect(res.body[0].songAvgRating).toBe(90.5);
      expect(res.body[0].favorites.length).toBe(2);
      expect(res.body[0].favorites[0].title).toBe('We Will Rock You');
      expect(res.body[0].favorites[0].artistName).toBe('Queen');
      expect(res.body[0].favorites[0].genre).toBe('Rock');
      expect(res.body[0].favorites[0].rating).toBe(88);
      expect(res.body[0].favorites[1].title).toBe('Careless Whisper');
      expect(res.body[0].favorites[1].artistName).toBe('George Michael');
      expect(res.body[0].favorites[1].genre).toBe('Classical');
      expect(res.body[0].favorites[1].rating).toBe(93);
    });

    it('It should respond with a 404 if no favs in db', async () => {
      const res = await request(app)
        .get("/api/v1/playlists");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "No playlists currently" });
    });
  });
})
