const EventEmitter = require("events").EventEmitter;
const JaegerClient = require('jaeger-client');
const Span = require("./Span");

const initTracer = JaegerClient.initTracer;

const {config, options} = require("../config");

class Tracer extends EventEmitter {
  constructor(_config, _options) {
    super();

    let cfg = {};
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
