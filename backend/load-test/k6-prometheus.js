/**
 * K6 Load Test with Prometheus Remote Write
 * 
 * This script sends K6 metrics to Prometheus for real-time monitoring in Grafana
 * 
 * Install: brew install k6
 * Run: k6 run --out experimental-prometheus-rw k6-prometheus.js
 * 
 * Or use k6 cloud for better integration:
 * k6 cloud k6-prometheus.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { b64encode } from 'k6/encoding';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const requestsTotal = new Counter('requests_total');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SCENARIO = __ENV.SCENARIO || 'load';
const PROMETHEUS_RW_URL = __ENV.PROMETHEUS_RW_URL || 'http://localhost:9090/api/v1/write';
const SIGNATURE_SECRET = __ENV.SIGNATURE_SECRET || '';

// Test data
const USER_IDS = [
  1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000
];

function generateAuthHeaders(userId) {
  const timestamp = new Date().toISOString();
  const payload = SIGNATURE_SECRET
    ? `${timestamp}${SIGNATURE_SECRET}${userId}`
    : `${timestamp}${userId}`;
  const sign = b64encode(payload, 'std', 'utf-8');
  
  return {
    'timestamp': timestamp,
    'user_id': String(userId),
    'sign': sign,
  };
}

const scenarios = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '1m',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '5m', target: 300 },
      { duration: '2m', target: 0 },
    ],
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },
      { duration: '30s', target: 500 },
      { duration: '1m', target: 500 },
      { duration: '30s', target: 10 },
      { duration: '1m', target: 10 },
    ],
  },
};

export const options = {
  scenarios: {
    [SCENARIO]: scenarios[SCENARIO],
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
  // Enable Prometheus remote write output
  ext: {
    loadimpact: {
      name: `Forecap API Load Test - ${SCENARIO}`,
    },
  },
};

export default function () {
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
  const headers = generateAuthHeaders(userId);
  
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/user-data`, { headers });
  const responseTime = Date.now() - startTime;
  
  apiResponseTime.add(responseTime);
  requestsTotal.add(1);
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.userName !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  sleep(0.1);
}

