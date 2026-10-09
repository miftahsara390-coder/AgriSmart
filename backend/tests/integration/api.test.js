/**
 * Integration tests for the AgriSmart backend API.
 *
 * These tests use supertest against the Express app without connecting to a real DB.
 * The DB connection is mocked so tests run without PostgreSQL running.
 */
import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_NAME = 'agrismart_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = 'localhost';

const mockDb = {
  sequelize: {
    define: jest.fn(() => ({})),
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn(),
  },
  connectDB: jest.fn().mockResolvedValue(true),
};

// Mock Sequelize database config
await jest.unstable_mockModule('../../src/config/database.js', () => ({
  ...mockDb,
  default: mockDb.sequelize,
}));

// Mock all models
const mockUser = {
  id: 'user-uuid-1',
  name: 'Test Farmer',
  email: 'test@agri.ma',
  role: 'user',
  location: 'Beni Mellal',
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  unscoped: jest.fn().mockReturnThis(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockCropModel = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({ id: 'crop-1', name: 'Tomato' }),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockTaskModel = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({ id: 'task-1', title: 'Task' }),
  count: jest.fn().mockResolvedValue(0),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockScanModel = {
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockObservationModel = {
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockSensorDataModel = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({ id: 'sensor-1' }),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockConversationModel = {
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({ id: 'conv-1' }),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
};

const mockAgent = {
  runAgent: jest.fn().mockResolvedValue({
    content: 'Yellow leaves are usually caused by nitrogen deficiency or overwatering.',
    toolsUsed: [],
  }),
  generateWithDeepSeekFallback: jest.fn(),
  generateWithGeminiFallback: jest.fn(),
};

await jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: mockUserModel,
  User: mockUserModel,
  ...mockUserModel,
}));

await jest.unstable_mockModule('../../src/models/Crop.js', () => ({
  default: mockCropModel,
  Crop: mockCropModel,
  ...mockCropModel,
}));

await jest.unstable_mockModule('../../src/models/Task.js', () => ({
  default: mockTaskModel,
  Task: mockTaskModel,
  ...mockTaskModel,
}));

await jest.unstable_mockModule('../../src/models/Scan.js', () => ({
  default: mockScanModel,
  Scan: mockScanModel,
  ...mockScanModel,
}));

await jest.unstable_mockModule('../../src/models/Observation.js', () => ({
  default: mockObservationModel,
  Observation: mockObservationModel,
  ...mockObservationModel,
}));

await jest.unstable_mockModule('../../src/models/SensorData.js', () => ({
  default: mockSensorDataModel,
  SensorData: mockSensorDataModel,
  ...mockSensorDataModel,
}));

await jest.unstable_mockModule('../../src/models/Conversation.js', () => ({
  default: mockConversationModel,
  Conversation: mockConversationModel,
  ...mockConversationModel,
}));

await jest.unstable_mockModule('../../src/ai/agent.js', () => ({
  default: mockAgent,
  ...mockAgent,
}));

const supertest = (await import('supertest')).default;
const jwt = (await import('jsonwebtoken')).default;
const bcrypt = (await import('bcrypt')).default;

// Dynamic import of app after mocks are registered
const { default: app } = await import('../../src/app.js');
const request = supertest(app);

// Helper: generate a valid JWT for tests
const makeToken = (userId = 'user-uuid-1') =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('returns 400 when fields are missing', async () => {
    const res = await request.post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 409 when email already exists', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    const res = await request.post('/api/auth/register').send({
      name: 'Test', email: 'existing@agri.ma', password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  test('registers successfully', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    const hashedPw = await bcrypt.hash('password123', 10);
    mockUserModel.create.mockResolvedValueOnce({
      ...mockUser, password: hashedPw,
    });
    const res = await request.post('/api/auth/register').send({
      name: 'New Farmer', email: 'new@agri.ma', password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });
});

describe('POST /api/auth/login', () => {
  test('returns 400 when fields are missing', async () => {
    const res = await request.post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('returns 401 for wrong credentials', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    const res = await request.post('/api/auth/login').send({
      email: 'nobody@agri.ma', password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });

  test('logs in successfully', async () => {
    const hashedPw = await bcrypt.hash('password123', 10);
    mockUserModel.findOne.mockResolvedValueOnce({ ...mockUser, password: hashedPw });
    const res = await request.post('/api/auth/login').send({
      email: 'test@agri.ma', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@agri.ma');
  });
});

// ─── Protected Route Tests ────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  test('returns 401 without token', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns user with valid token', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const token = makeToken();
    const res = await request.get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });
});

// ─── Crops Tests ──────────────────────────────────────────────────────────────
describe('GET /api/crops', () => {
  test('returns 401 without token', async () => {
    const res = await request.get('/api/crops');
    expect(res.status).toBe(401);
  });

  test('returns crops array with valid token', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    mockCropModel.findAll.mockResolvedValueOnce([]);
    const token = makeToken();
    const res = await request.get('/api/crops').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.crops)).toBe(true);
  });
});

describe('POST /api/crops', () => {
  test('creates a crop', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const newCrop = { id: 'crop-1', name: 'Tomatoes', userId: 'user-uuid-1' };
    mockCropModel.create.mockResolvedValueOnce(newCrop);
    const token = makeToken();
    const res = await request
      .post('/api/crops')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tomatoes' });
    expect(res.status).toBe(201);
    expect(res.body.crop.name).toBe('Tomatoes');
  });
});

// ─── Tasks Tests ──────────────────────────────────────────────────────────────
describe('POST /api/tasks', () => {
  test('creates a task', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const newTask = { id: 'task-1', title: 'Water tomatoes', userId: 'user-uuid-1', status: 'pending' };
    mockTaskModel.create.mockResolvedValueOnce(newTask);
    const token = makeToken();
    const res = await request
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Water tomatoes' });
    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Water tomatoes');
  });
});

describe('PUT /api/tasks/:id (complete task)', () => {
  test('marks a task as completed', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const task = {
      id: 'task-1', title: 'Water tomatoes', status: 'pending', userId: 'user-uuid-1',
      update: jest.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
    };
    mockTaskModel.findOne.mockResolvedValueOnce(task);
    const token = makeToken();
    const res = await request
      .put('/api/tasks/task-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
  });
});

// ─── AI Agent Tests ───────────────────────────────────────────────────────────
describe('POST /api/agent/chat', () => {
  test('returns 400 without message', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const token = makeToken();
    const res = await request
      .post('/api/agent/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('returns a response for a valid message', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const token = makeToken();
    const res = await request
      .post('/api/agent/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What should I do if my tomato leaves are yellow?' });
    expect(res.status).toBe(200);
    expect(res.body.response).toBeDefined();
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  test('returns ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
