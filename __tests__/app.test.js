require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({

          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const newTodo = {
      todo: 'wash the dishes',
      completed: false
    };

    const createdTodo = 
      {
        ...newTodo,
        id: 5,
        user_id: 2
      };

    test('creates a new todo', async() => {

      const todo = {
        'todo': 'wash the dishes',
        'completed': false
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(data.body).toEqual(createdTodo);
    });
  

    test('returns all user todos', async() => {
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([createdTodo]);
    });

    test('returns one user todo', async() => {
      const data = await fakeRequest(app)
        .get('/api/todos/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(createdTodo);
    });

    test('updates one todo', async() => {

      const expectation = {
        id: 1,
        todo: 'clean your room',
        completed: true,
        user_id: 1
      };

      const modification = { completed: true };

      const data = await fakeRequest(app)
        .put('/api/todos/1')
        .set('Authorization', token)
        .send(modification)
        .expect('Content-Type', /json/);
      //.expect(200);

      expect(data.body).toEqual(expectation);
    });


  });
});
