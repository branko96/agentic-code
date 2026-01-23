import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Backend API', () => {
  test('should return hello message', async ({ request }) => {
    const response = await request.get(`${API_URL}/`);
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('Hello from NestJS Backend');
  });

  test('should return health check status', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('backend');
    expect(data.timestamp).toBeTruthy();
  });
});
