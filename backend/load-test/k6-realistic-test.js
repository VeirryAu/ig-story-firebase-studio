/**
 * Realistic Load Test - Mimics real user behavior
 * 
 * This script simulates realistic user distribution:
 * - 50% of requests for users in first 1M (most active)
 * - 30% for users in first 5M (moderate users)
 * - 20% for all users (long tail)
 * 
 * Usage: BASE_URL=http://your-ec2-ip:3000 k6 run k6-realistic-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const requestsTotal = new Counter('requests_total');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_USER_ID = parseInt(__ENV.MAX_USER_ID || '10000000');

// Realistic user ID distribution
function getRandomUserId() {
  const rand = Math.random();
  
  if (rand < 0.5) {
    // 50% of requests for first 1M users (most active)
    return Math.floor(Math.random() * 1000000) + 1;
  } else if (rand < 0.8) {
    // 30% for first 5M users (moderate users)
    return Math.floor(Math.random() * 5000000) + 1;
  } else {
    // 20% across all users (long tail)
    return Math.floor(Math.random() * MAX_USER_ID) + 1;
  }
}

function generateAuthHeaders(userId) {
  const timestamp = new Date().toISOString();
  const sign = btoa(timestamp + 'forecap2025' + userId);
  
  return {
    'timestamp': timestamp,
    'user_id': String(userId),
    'sign': sign,
  };
}

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Warm up: 10 users
    { duration: '5m', target: 50 },   // Ramp to normal: 50 users
    { duration: '10m', target: 100 }, // Normal load: 100 users
    { duration: '5m', target: 150 }, // Peak load: 150 users
    { duration: '3m', target: 100 }, // Back to normal
    { duration: '2m', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'p(99.9)', 'count'],
};

export default function () {
  const userId = getRandomUserId();
  const headers = generateAuthHeaders(userId);
  
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/user-data`, { headers });
  const responseTime = Date.now() - startTime;
  
  apiResponseTime.add(responseTime);
  requestsTotal.add(1);
  
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
    if (response.status !== 200) {
      console.error(`User ${userId}: ${response.status} - ${response.body.substring(0, 100)}`);
    }
  } else {
    errorRate.add(0);
  }
  
  // Realistic think time (users don't click instantly)
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data) {
  return `
========================================
Realistic Load Test Summary
========================================
Test Configuration:
  - Base URL: ${BASE_URL}
  - Max User ID: ${MAX_USER_ID.toLocaleString()}
  - User Distribution: 50% (1M) / 30% (5M) / 20% (all)

HTTP Metrics:
  - Total Requests: ${data.metrics.http_reqs.values.count.toLocaleString()}
  - Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
  - Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
  - P50 Response Time: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms
  - P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
  - P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
  - Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms

Custom Metrics:
  - API Response Time (avg): ${data.metrics.api_response_time.values.avg.toFixed(2)}ms
  - Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%

VUs:
  - Max VUs: ${data.metrics.vus_max.values.max}
  - Avg VUs: ${data.metrics.vus.values.avg.toFixed(2)}

Performance Assessment:
  ${assessPerformance(data)}

========================================
`;
}

function assessPerformance(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const errorRate = data.metrics.http_req_failed.values.rate;
  const throughput = data.metrics.http_reqs.values.count / (data.state.testRunDurationMs / 1000);
  
  let assessment = '';
  
  if (p95 < 100 && errorRate < 0.001 && throughput > 1000) {
    assessment = '✅ EXCELLENT - Performance exceeds targets';
  } else if (p95 < 200 && errorRate < 0.01 && throughput > 500) {
    assessment = '✅ GOOD - Performance meets targets';
  } else if (p95 < 500 && errorRate < 0.02) {
    assessment = '⚠️  ACCEPTABLE - Performance is borderline, consider optimizations';
  } else {
    assessment = '❌ NEEDS IMPROVEMENT - Consider upgrading instance or switching to Go/Rust';
  }
  
  return assessment;
}

