const opentracing = require('opentracing');
const initTracer = require('jaeger-client').initTracer;
const bclog = require('bearcatjs-logger').getLogger('default');

var config = {
  serviceName: 'ApiService',
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
var options = {
  tags: {
    'ApiService.version': '1.0.2',
  },
//metrics: metrics,
  logger: console,
};


//const tracer = new opentracing.Tracer();
const tracer = initTracer(config, options);

const span = tracer.startSpan('Register');


const info = (evt, data) => {
  let log;
  if (typeof data === "object") {
    log = {"event": evt, ...data};
  } else {
    log = {"event": evt, data};
  }
  console.log(log);
  
  span.log(log);
};

const error = (evt, err) => {
  span.setTag(opentracing.Tags.ERROR, true);
  span.log({'event': evt, 'error.object': err, 'message': err.message, 'stack': err.stack});
};

const infod = (evt, data) => {
  info(evt, data);

  span.finish();
};

const errord = (evt, data) => {
  error(evt, data);

  span.finish();
};



let err = new Error("invalid options");
logError(err);

let evt, data;

evt = "register_email";
data = "zhouzhiyu@beliefchain.com";
logInfo(evt, data);

evt = "register_spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
logInfod(evt, data);


