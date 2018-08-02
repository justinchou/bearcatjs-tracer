const EventEmitter = require("events").EventEmitter;
const JaegerClient = require('jaeger-client');
const Span = require("./Span");
const initTracer = JaegerClient.initTracer;

const {config, options, mLogger} = require("../config");

class Tracer extends EventEmitter {
  constructor(settings) {
    super();

    this.settings = settings;
    this.config = null;
    this.options = null;

    this.logger = null;
    this.tracer = null;

    this.init();
  }

  init() {
    let cfg = {};
    if (this.settings && this.settings.config && typeof this.settings.config === 'object') {
      cfg = JSON.parse(JSON.stringify(this.settings.config));
    } else {
      cfg = JSON.parse(JSON.stringify(config));
    }

    if (this.settings && this.settings.serviceName && typeof this.settings.serviceName === 'string') {
      cfg.serviceName = this.settings.serviceName;
    }

    let opts = {};
    if (this.settings && this.settings.options && typeof this.settings.options === "object") {
      opts = JSON.parse(JSON.stringify(this.settings.options));
    } else {
      opts = options;
      opts.logger = mLogger;
    }

    if (this.settings && this.settings.logger && typeof this.settings.logger.info === "function" && typeof this.settings.logger.error === "function") {
      opts.logger = this.settings.logger;
    }

    this.config = cfg;
    this.options = opts;

    this.logger = (this.settings && typeof this.settings === "object" && this.settings.hasOwnProperty("logger")) ? this.settings.logger : mLogger;
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
