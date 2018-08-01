const EventEmitter = require("events").EventEmitter;
const JaegerClient = require('jaeger-client');

const opentracing = JaegerClient.opentracing;
const initTracer = JaegerClient.initTracer;

const bclog = require('bearcatjs-logger').getLogger('default');

const {config, options} = require("../config");

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
    const parentSpan = this.tracer.extract(opentracing.FORMAT_TEXT_MAP, transformObj);
    this.span = this.tracer.startSpan(this.name, {childOf: parentSpan});
    //console.log(parentSpan);
    //console.log(this.span._spanContext);

    return this;
  }

  followsFrom(transformObj) {
    const parentSpan = this.tracer.extract(opentracing.FORMAT_TEXT_MAP, transformObj);
    const reference  = opentracing.followsFrom(parentSpan);
    this.span = this.tracer.startSpan(this.name, {references: [reference]});
    //console.log(parentSpan);
    //console.log(this.span._spanContext);

    return this;
  }

  getSpan() { return this.span; }

  context() { return this.span.context(); }
  tracer() { return this.span.tracer(); }
  operationName() { return this.span.operationName(); }
  serviceName() {return this.span.serviceName(); }

  setOperationName(setOperationName) { this.span.setOperationName(setOperationName); return this; }

  addTags(...args) { this.span.addTags(...args); return this; }
  setTags(...args) { return this.addTags(...args); }

  addTag(...args) { this.span.setTag(...args); return this; }
  setTag(...args) { return this.addTag(...args); }

  setBaggageItem(...args) { this.span.setBaggageItem(...args); return this; }
  getBaggageItem(key) { return this.span.getBaggageItem(key); }

  inject(transformObj) {
    if (!transformObj || typeof transformObj !== 'object') return;

    this.tracer.inject(this.span, opentracing.FORMAT_TEXT_MAP, transformObj);
  }

  logToSpan(evt, data) {
    let log;
    if (typeof data === "object") {
      log = {"event": evt, ...data};
    } else {
      log = {"event": evt, data};
    }
    
    this.span.log(log);
    return log;
  }

  debug(evt, data) {
    const log = this.logToSpan(evt, data);
    console.log("debug: [ %j ]", log);
  }

  info(evt, data) {
    const log = this.logToSpan(evt, data);
    console.log("info: [ %j ]", log);
  }

  warn(evt, data) {
    const log = this.logToSpan(evt, data);
    console.log("warn: [ %j ]", log);
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

  finish() {
    console.log("Finished: [ %s ]", this.name);
    this.span.finish();
  }

  debugEnd(evt, data) {
    this.debug(evt, data);
    this.finish(); 
  };
  
  infoEnd(evt, data) {
    this.info(evt, data);
    this.finish(); 
  };
  
  warnEnd(evt, data) {
    this.warn(evt, data);
    this.finish(); 
  };
  
  errorEnd(evt, data) {
    this.error(evt, data);
    this.finish(); 
  };
}

class Tracer extends EventEmitter {
  constructor(_config, _options) {
    super();

    let cfg;
    if (_config && typeof _config === 'object') {
      cfg = _config;
    } else {
      cfg = JSON.parse(JSON.stringify(config));
    }

    if (_config && typeof _config === 'string') {
      cfg.serviceName = _config;
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