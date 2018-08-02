const Debug = require("debug")("bearcatjs-tracer");

const mLogger = { debug: Debug, info: Debug, warn: Debug, error: Debug, trace: Debug, fatal: Debug };

let config = {
  serviceName: 'BearcatService',
  disable: false,
  sampler: {
    type: 'const',
    param: 1
  },
  
  reporter: {
    logSpans: true,
    agentHost: "127.0.0.1",
    agentPort: 6832,
    flushIntervalMs: 10,
  },

  throttler: {
    host: "127.0.0.1",
    port: 5778,
    refreshIntervalMs: 10,
  }
};

let options = {
  tags: {
    'BearcatTracerService.version': require("../package.json").version,
  },
  // metrics: metrics,
  logger: mLogger,
};

module.exports = {config, options, mLogger};
