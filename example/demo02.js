const opentracing = require('opentracing');
const EventEmitter = require("events").EventEmitter;
const initTracer = require('jaeger-client').initTracer;
const bclog = require('bearcatjs-logger').getLogger('default');

let config = {
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

let options = {
  tags: {
    'ApiService.version': '1.0.2',
  },
  // metrics: metrics,
  logger: console,
};

class Span extends EventEmitter {
  constructor(tracer, name) {
    super();

    this.tracer = tracer;
    this.name = name;

    this.span = null;
  }

  init() {
    this.span = this.tracer.startSpan(this.name);
    return this;
  }

  // childOf(parentId) {
  //   this.span = this.tracer.startSpan(this.name, {childOf: parentId});
  //   return this;
  // }

  info(evt, data) {
    let log;
    if (typeof data === "object") {
      log = {"event": evt, ...data};
    } else {
      log = {"event": evt, data};
    }
    console.log("info: [ %j ]", log);
    
    this.span.log(log);
  }

  error(evt, err) {
    if (!err) return;

    this.span.setTag(opentracing.Tags.ERROR, true);

    let log;
    if (err.message && err.stack) {
      log = {'event': evt, 'error.object': err, 'message': err.message, 'stack': err.stack};
    } else {
      log = {"event": evt, ...err};
    }
    console.log("error: [ %j ]", log);

    this.span.log(log);
  };

  infod(evt, data) {
    this.info(evt, data);
  
    this.span.finish();
  };
  
  errord(evt, data) {
    this.error(evt, data);
  
    this.span.finish();
  };
}

class Tracer extends EventEmitter {
  constructor(_config, _options) {
    super();

    this.config = _config || config;
    this.options = _options || options;

    this.tracer = null;

    this.init();
  }

  init() {
    // this.tracer = new opentracing.Tracer();
    this.tracer = initTracer(this.config, this.options);

    return this;
  }

  getSpan(name) {
    if (typeof name !== "string" || !name) name = "default";

    const span = new Span(this.tracer, name);
    return span;
  }
} 

module.exports = Tracer;

let tracer = new Tracer();
let span = tracer.getSpan("Register").init(); //childOf("6cd67d313d9f808c:6cd67d313d9f808c:0:1");

let evt, data, err;

evt = "register_dberr";
err = new Error("invalid options");
span.error(evt, err);

evt = "register_invalid_params"
err = {email: "123#126.com", passwd: "0123456789"};
span.error(evt, err);

evt = "register_email";
data = "zhouzhiyu@beliefchain.com";
span.info(evt, data);

evt = "register_spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
span.infod(evt, data);


