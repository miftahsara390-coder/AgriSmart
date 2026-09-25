const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');
const Crop = require('../../src/models/Crop');
const Task = require('../../src/models/Task');
const RefreshToken = require('../../src/models/RefreshToken');

let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });

  const res = await request(app).post('/api/auth/register').send({
    name: 'Farmer',
    email: 'farmer2@test.com',
    password: 'password123',
  });
  token = res.body.accessToken;
  userId = res.body.user.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Crops API', () => {
  let cropId;

  it('POST /api/crops — creates a crop', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tomatoes', variety: 'Cherry', status: 'growing' });

    expect(res.status).toBe(201);
    expect(res.body.crop.name).toBe('Tomatoes');
    cropId = res.body.crop.id;
  });

  it('GET /api/crops — returns crops list', async () => {
    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.crops.length).toBeGreaterThan(0);
  });

  it('GET /api/crops/:id — returns crop by id', async () => {
    const res = await request(app)
      .get(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.crop.id).toBe(cropId);
  });

  it('PUT /api/crops/:id — updates a crop', async () => {
    const res = await request(app)
      .put(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'harvested' });

    expect(res.status).toBe(200);
    expect(res.body.crop.status).toBe('harvested');
  });

  it('DELETE /api/crops/:id — deletes a crop', async () => {
    const res = await request(app)
      .delete(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('Tasks API', () => {
  let taskId;

  it('POST /api/tasks — creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Water tomatoes', type: 'watering', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Water tomatoes');
    taskId = res.body.task.id;
  });

  it('GET /api/tasks — returns tasks list', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it('PUT /api/tasks/:id — updates a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('done');
  });

  it('DELETE /api/tasks/:id — deletes a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});


