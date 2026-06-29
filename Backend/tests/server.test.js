const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.AI_SERVICE_URL = 'http://localhost:9999';
process.env.NODE_ENV = 'test';

const app = require('../server');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const addr = server.address();
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'docquery-backend');
    assert.ok(data.timestamp);
  });
});

describe('POST /api/upload', () => {
  it('should reject request with no file', async () => {
    const form = new FormData();
    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  it('should reject non-PDF files', async () => {
    const form = new FormData();
    const blob = new Blob(['not a pdf'], { type: 'text/plain' });
    form.append('file', blob, 'test.txt');

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('PDF'));
  });
});

describe('POST /api/chat', () => {
  it('should reject missing fields', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Missing'));
  });

  it('should reject empty strings for question', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '', session_id: 'abc' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  it('should reject empty strings for session_id', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'hello', session_id: '' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.error, 'Route not found');
  });
});
