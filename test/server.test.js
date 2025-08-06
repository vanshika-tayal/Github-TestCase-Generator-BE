const request = require('supertest');
const app = require('../server');

describe('Server Health Check', () => {
  test('GET /health should return 200 and server status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('API Routes', () => {
  test('GET /api/ai/frameworks should return supported frameworks', async () => {
    const response = await request(app)
      .get('/api/ai/frameworks')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('frameworks');
    expect(Array.isArray(response.body.frameworks)).toBe(true);
    expect(response.body.frameworks.length).toBeGreaterThan(0);
  });

  test('GET /api/test-cases should return empty array initially', async () => {
    const response = await request(app)
      .get('/api/test-cases')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('testCases');
    expect(Array.isArray(response.body.testCases)).toBe(true);
  });

  test('GET /api/test-cases/stats/overview should return statistics', async () => {
    const response = await request(app)
      .get('/api/test-cases/stats/overview')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('stats');
    expect(response.body.stats).toHaveProperty('totalTestCases');
    expect(response.body.stats).toHaveProperty('totalSummaries');
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Route not found');
  });
}); 