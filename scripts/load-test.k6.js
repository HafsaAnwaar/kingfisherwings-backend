/**
 * Week 24 — Load test script (k6).
 *
 * Usage:
 *   k6 run -e BASE_URL=https://staging.example.com -e EMAIL=... -e PASSWORD=... scripts/load-test.k6.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function setup() {
  const login = http.post(
    `${BASE}/auth/login`,
    JSON.stringify({
      email: __ENV.EMAIL,
      password: __ENV.PASSWORD,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  const token = login.json('data.access_token');
  return { token };
}

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}` };

  const jobs = http.get(`${BASE}/jobs?page=1&limit=20`, { headers });
  check(jobs, { 'jobs 200': (r) => r.status === 200 });

  const boe = http.get(`${BASE}/documentation/boe/dashboard?page=1&limit=10`, { headers });
  check(boe, { 'boe dashboard 200': (r) => r.status === 200 });

  sleep(1);
}
