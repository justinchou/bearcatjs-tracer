let config = {
  serviceName: 'SphinxService',
  disable: false,
  sampler: {
    type: 'remote',
    param: 0.5,
    host: "127.0.0.1",
    port: 5778,
    refreshIntervalMs: 500 
  },
  
  reporter: {
    logSpans: true,
    agentHost: "127.0.0.1",
    agentPort: 6832,
    flushIntervalMs: 500,
  },

  throttler: {
    host: "127.0.0.1",
    port: 5778,
    refreshIntervalMs: 500,
  }
};

let options = {
  tags: {
    'SphinxService.version': '1.0.2',
  },
  // metrics: metrics,
  logger: console,
};

module.exports = {config, options};
