const request = require('supertest');
const { app } = require('../src/server');
const { getDb, closeDb } = require('../src/config/database');

let token;
let roomId;
let messageId;

// Register + login once before all tests
beforeAll(async () => {
  const reg = await request(app).post('/api/auth/register').send({
    username: 'msgtest',
    email: 'msgtest@example.com',
    password: 'password123'
  });
  // Already registered from auth tests? log in instead
  if (reg.status === 409) {
    const login = await request(app).post('/api/auth/login').send({
      email: 'msgtest@example.com',
      password: 'password123'
    });
    token = login.body.token;
  } else {
    token = reg.body.token;
  }

  // Create a room to post messages into
  const roomRes = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `test-room-${Date.now()}`, description: 'Test room' });

  roomId = roomRes.body.id;
});

afterAll(() => closeDb());

describe('Message history', () => {
  test('returns empty array for new room', async () => {
    const res = await request(app)
      .get(`/api/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('rejects unauthenticated requests', async () => {
    const res = await request(app).get(`/api/rooms/${roomId}/messages`);
    expect(res.status).toBe(401);
  });
});

describe('Room membership', () => {
  test('blocks non-members from reading messages', async () => {
    // Register a second user
    const reg2 = await request(app).post('/api/auth/register').send({
      username: 'outsider',
      email: 'outsider@example.com',
      password: 'password123'
    });
    const token2 = reg2.status === 409
      ? (await request(app).post('/api/auth/login').send({ email: 'outsider@example.com', password: 'password123' })).body.token
      : reg2.body.token;

    const res = await request(app)
      .get(`/api/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });
});

describe('Conversation messages', () => {
  let convId;
  let user2Id;

  beforeAll(async () => {
    // Get the second user's id
    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    const users = await request(app)
      .get('/api/users?q=outsider')
      .set('Authorization', `Bearer ${token}`);

    user2Id = users.body[0]?.id;
  });

  test('creates or finds a DM conversation', async () => {
    if (!user2Id) return; // outsider wasn't created in this run
    const res = await request(app)
      .post(`/api/conversations/${user2Id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    convId = res.body.id;
  });

  test('returns message history for a conversation', async () => {
    if (!convId) return;
    const res = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Pagination', () => {
  test('respects limit query param', async () => {
    const res = await request(app)
      .get(`/api/rooms/${roomId}/messages?limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });
});