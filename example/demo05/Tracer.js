const EventEmitter = require("events").EventEmitter;
const JaegerClient = require('jaeger-client');

const opentracing = JaegerClient.opentracing;
const initTracer = JaegerClient.initTracer;

const bclog = require('bearcatjs-logger').getLogger('default');

const {config, options} = require("./config");

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

  childOf(transformObj) {
    const parentId = this.tracer.extract(opentracing.FORMAT_TEXT_MAP, transformObj);
    this.span = this.tracer.startSpan(this.name, {childOf: parentId});

    return this;
  }

  getSpan() {
    return this.span;
  }

  inject(transformObj) {
    if (!transformObj || typeof transformObj !== 'object') return;

    this.tracer.inject(this.span, opentracing.FORMAT_TEXT_MAP, transformObj);
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

  infoEnd(evt, data) {
    this.info(evt, data);
  
    console.log("Finished: [ %s ]", this.name);
    this.span.finish();
  };
  
  errorEnd(evt, data) {
    this.error(evt, data);
  
    console.log("Finished: [ %s ]", this.name);
    this.span.finish();
  };
}

class Tracer extends EventEmitter {
  constructor(_config, _options) {
    super();

    let cfg;
    if (!_config && typeof _config === 'object') {
      cfg = _config;
    }
    else if (!_config && typeof _config === 'string') {
      cfg.serviceName = _config;
    }
    else {
      cfg = JSON.parse(JSON.stringify(config));
    }

    this.config = cfg;
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
