/**
 * K6 Load Testing Script for Forecap API
 * 
 * Install: brew install k6 (macOS) or https://k6.io/docs/getting-started/installation/
 * Run: k6 run k6-test.js
 * 
 * This script tests:
 * - GET /api/user-data endpoint
 * - Various load scenarios (smoke, load, stress, spike)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SCENARIO = __ENV.SCENARIO || 'load'; // smoke, load, stress, spike

// Test data - user IDs to test
const USER_IDS = [
  1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000
];

// Generate auth headers
function generateAuthHeaders(userId) {
  const timestamp = new Date().toISOString();
  const sign = btoa(timestamp + 'forecap2025' + userId);
  
  return {
    'timestamp': timestamp,
    'user_id': String(userId),
    'sign': sign,
  };
}

// Scenarios
const scenarios = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '1m',
    tags: { test_type: 'smoke' },
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },   // Ramp up to 50 users
      { duration: '5m', target: 50 },   // Stay at 50 users
      { duration: '2m', target: 100 },   // Ramp up to 100 users
      { duration: '5m', target: 100 },   // Stay at 100 users
      { duration: '2m', target: 0 },     // Ramp down
    ],
    tags: { test_type: 'load' },
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
    tags: { test_type: 'stress' },
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },
      { duration: '30s', target: 500 },  // Spike to 500 users
      { duration: '1m', target: 500 },
      { duration: '30s', target: 10 },
      { duration: '1m', target: 10 },
    ],
    tags: { test_type: 'spike' },
  },
};

export const options = {
  scenarios: {
    [SCENARIO]: scenarios[SCENARIO],
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'], // 95% < 200ms, 99% < 500ms
    http_req_failed: ['rate<0.01'],                // Error rate < 1%
    errors: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'p(99.9)', 'p(99.99)', 'count'],
};

export default function () {
  // Select random user ID
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
  const headers = generateAuthHeaders(userId);
  
  // Make request
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/user-data`, { headers });
  const responseTime = Date.now() - startTime;
  
  // Record metrics
  apiResponseTime.add(responseTime);
  
  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.userName !== undefined && body.trxCount !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorRate.add(1);
    console.error(`Request failed for user ${userId}: ${response.status} - ${response.body.substring(0, 100)}`);
  } else {
    errorRate.add(0);
  }
  
  // Think time (simulate user behavior)
  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
    'summary.html': htmlReport(data),
  };
}

function textSummary(data, options) {
  // Simple text summary
  return `
========================================
Load Test Summary
========================================
Scenario: ${SCENARIO}
Base URL: ${BASE_URL}

HTTP Metrics:
  - Total Requests: ${data.metrics.http_reqs.values.count}
  - Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%
  - Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
  - P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
  - P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms

Custom Metrics:
  - API Response Time (avg): ${data.metrics.api_response_time.values.avg.toFixed(2)}ms
  - Error Rate: ${data.metrics.errors.values.rate * 100}%

VUs:
  - Max VUs: ${data.metrics.vus_max.values.max}
  - Avg VUs: ${data.metrics.vus.values.avg.toFixed(2)}
========================================
`;
}

function htmlReport(data) {
  // Simple HTML report
  return `
<!DOCTYPE html>
<html>
<head>
  <title>K6 Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .metric { margin: 10px 0; }
  </style>
</head>
<body>
  <h1>K6 Load Test Report</h1>
  <div class="metric">
    <h2>Summary</h2>
    <p><strong>Scenario:</strong> ${SCENARIO}</p>
    <p><strong>Base URL:</strong> ${BASE_URL}</p>
    <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}</p>
    <p><strong>Failed Requests:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
  </div>
  <div class="metric">
    <h2>Response Times</h2>
    <p><strong>Average:</strong> ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
    <p><strong>P95:</strong> ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</p>
    <p><strong>P99:</strong> ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms</p>
  </div>
</body>
</html>
`;
}

