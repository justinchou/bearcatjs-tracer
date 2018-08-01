// const opentracing = require('opentracing');
const EventEmitter = require("events").EventEmitter;
const JaegerClient = require('jaeger-client');
const opentracing = JaegerClient.opentracing;
const initTracer = JaegerClient.initTracer;
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

  childOf(parentId) {
    this.span = this.tracer.startSpan(this.name, {childOf: parentId});
    return this;
  }

  getSpan() {
    return this.span;
  }

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
    this.tracer = initTracer(this.config, this.options);

    return this;
  }

  getSpan(name) {
    if (typeof name !== "string" || !name) name = "default";

    const span = new Span(this.tracer, name);
    return span;
  }

  getTracer() {
    return this.tracer;
  }
} 

module.exports = Tracer;



const tracer = new Tracer();
const span = tracer.getSpan("Register").init();

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

const transform  = {};
const realTracer = tracer.getTracer();
const realSpan   = span.getSpan();
realTracer.inject(realSpan, opentracing.FORMAT_TEXT_MAP, transform);



console.log(transform);

const subTracer = new Tracer();
const parentId = subTracer.getTracer().extract(opentracing.FORMAT_TEXT_MAP, transform);
const subSpan = subTracer.getSpan("Sub Register").childOf(parentId);

evt = "sub_register_spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
subSpan.infod(evt, data);

// console.log(realSpan, subSpan.getSpan());
