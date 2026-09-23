const client = require('prom-client');

// Enable default metrics collection (CPU, Memory, Event Loop, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'asset_app_' });

// Custom metrics
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const assetTotalGauge = new client.Gauge({
  name: 'assets_total_count',
  help: 'Total number of registered assets',
  labelNames: ['status'],
});

const maintenanceCostGauge = new client.Gauge({
  name: 'maintenance_total_cost_vnd',
  help: 'Total cost incurred for equipment maintenance in VND',
});

module.exports = {
  client,
  register: client.register,
  httpRequestCounter,
  httpRequestDurationHistogram,
  assetTotalGauge,
  maintenanceCostGauge,
};
