[![Build Status][ci-img]][ci] [![NPM Published Version][npm-img]][npm]

# bearcatjs-tracer

trace info among micro-services

## Quick Start

1. First Install Package:

  `npm i -s bearcatjs-tracer` OR `yarn add bearcatjs-tracer`

2. Then Include The Package:

  `const Tracer = require("bearcatjs-tracer");`

3. In Process A:

  ```js
  // init the tracer.
  const tracer = new Tracer({serviceName: "ApiService", logger: console});
  const span = tracer.getSpan("Register").init();
  
  // trace info, data is string/bool/number/object 
  evt = "register-email";
  data = "zhou78620051@126.com";
  span.info(evt, data);
  
  // trace error
  evt = "register-invalid-params"
  err = {email: "zhou78620051#126.com", passwd: "0123456789"};
  span.error(evt, err);
  
  // trace info with end, which send data to es server.
  evt = "register-spx";
  data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
  span.infoEnd(evt, data);
  
  // inject data into the data to send to another process.
  span.inject(data);
  
  // sending data to another service B.
  ```
4. In Process B:

  ```js
  // recving data from service A.
  
  // init the tracer.
  const subTracer = new Tracer();
  
  // set current tracer child of tracer A.
  const subSpan = subTracer.getSpan("SubRegister").childOf(data);
  
  // trace info with end.
  evt = "sub-register-spx";
  subData = {...data, txHash: "0x1234"};
  subSpan.infoEnd(evt, subData);
  ```

5. In Process C:

  ```js
  // recving data from service B.
  
  // init the tracer.
  const refTracer = new Tracer();

  // set current tracer brother of tracer B.
  const refSpan = subTracer.getSpan("RefRegister").followsFrom(data);
  
  evt = "ref-register-spx";
  data = {...data, logInfo: {txHash: "0x234"}};
  refSpan.infoEnd(evt, data);
  ```


### Concepts And Specifications

First Maybe You Need To Understand The Structure Of The Tracer.

Make A Glance At: http://opentracing.io/documentation/

Especially: https://github.com/opentracing/specification/blob/master/specification.md

Then You Will Have The Concept Of Tracer And Span, And Relations Of Spans.

Some Of You Maybe Feel It Hard To Find How To Config, How To Inject And Report, Then You May Need The Following:



### Settings

* serviceName {String} 
* logger {Object} Log instance, with functions info and error at least, suggest to use [BearcatJs-Logger][bearcat-logger] Which Is Better Than Log4js.
* config {Object} See Configration Part.
* options {Object} See Options Part.


#### Configuration

Jaeger Config Schema

* serviceName {String} 
* disable {Boolean} true to use `opentracing.Tracer()` with all custom config ignored.
* sampler {Object} Data Sample Strategy
  * type {String} Required, Support: `const`, `remote`, `ratelimiting`, `lowerbound`, `probabilistic`
  * param {Number} Required, Range [0.0, 1.0], judge how much percent of tracer log send to the server. When type is `const`, this value need to equal 1 to make the sampler works.
  * host {String} default "127.0.0.1", host to fetch sample config
  * port {Number} default 5778, port to fetch sample config
  * refreshIntervalMs {Number} default 60000ms, Every interval ms fetch the sample settings from server.
* reporter {Object} Used To Transfer Data To Jaeger Backend.
  * logSpans {Boolean} true to log sent data 
  * agentHost {Number} default "127.0.0.1", agent udp host
  * agentPort {Number} default 6832, agent udp port
  * flushIntervalMs {Number} default 1000ms. Interval to flush the data cached by the sender to agent.
* throttler {Object} Rate Limit Usage.
  * host {String}
  * port {Number}
  * refreshIntervalMs {Number}

##### Different Sampler Types

1. const: always make the same decision
2. probabilistic: samples traces with a certain fixed probability.
3. ratelimiting: samples only up to a fixed number of traces per second.
4. remote: polls Jaeger agent for sampling strategy

##### Reporter Logic

Reporter Contains `sender` And `reporter`.

**Sender** cache data and send data to agent with UDP. Just like an EMS, you give me data, I store it somewhere, and when time ticks or the warehouse is full, I deliver it for you, without caring anything about what the package is.

The `agentHost`, `agentPort` and `options.logger` are demanded.

Currently, it supports udp sender.

**Reporter** is a strategy, when to send what data.

The `flushIntervalMs` set when to send, `options.metrics` and `options.logger` are for what to append to the sent information.

Currently, it supports noop, logging, in memory, remote and composite.

The noop is default, do nothing, the in memrory is for test usage. Logging is opened when `logSpans` set to true, remote is used for sending data to jaeger agent. Composite is used when more than one reporters are used.


#### Options

Options Schema

* metrics {Object} Used to trace the value of something, usage, counter, time and so on. 
* logger {Object} Logger instance, info and error functions are necessary. Suggest To Use [BearcatJs-Logger](https://github.com/justinchou/bearcatjs-logger)
* tags {Object} process-level tags, key-value pairs
* reporter {Object} Reporter instance
* throttler {Object} Throttler instance



### Apis

#### Tracer

**new Tracer(Settings) : Tracer**

`Settings` Object, See Above.

Example:

```js
const settings = {serviceName: "BearcatTracer", logger: bearcatLogger};
const tracer = new Tracer(settings);
```

The Example Use Config And Options Of Default Settings.


**tracer.getSpan(spanName) : Span**

spanName: String

Returns A Instance Of Span, With Name `spanName`.

Example:

```js
const span = tracer.getSpan(spanName);
```

#### Span

Get Span Instance With `tracer.getSpan()`.

**span.init()**

Init Span Instance, With No Parent.

**span.childOf(transmit)**

Init Span Instance, With Parent span Transmited With transmit Object.

**span.followsFrom(transmit)**

Init Span Instance, Follows span Transmited With transmit Object.

Example:

```js
const spanA = tracer.getSpan(spanNameA).init();
const spanB = tracer.getSpan(spanNameB).childOf(transmit);
const spanC = tracer.getSpan(spanNameC).followsFrom(transmit);
```

**span.addTags(tags)**
**span.setTags(tags)**

Set Multiple Tags To The Trace Span, Support Chain Call.
The Two Functions Are The Same.

* tags: Object

**span.addTag(tagName, tagValue)**
**span.setTag(tagName, tagValue)**

Set Single Tag To The Trace Span, Support Chain Call.
The Two Functions Are The Same.

* tagName: String
* tagValue: String, Number, Boolean...

Examples:

```js
span.addTags({"url": "www.wumingxiaozu.com", "username": "JustinChou"}).addTags({"mood": "happy"});

span.addTag("url", "www.wumingxiaozu.com").addTag("username", "JustinChou").addTags({"mood": "happy"});
```

**span.debug(eventName, logInfo)**
**span.info(eventName, logInfo)**
**span.warn(eventName, logInfo)**
**span.error(eventName, logInfo)**

Write Trace Log With Different Level.

* eventName: String
* logInfo: Object, String, Number, Boolean... Need To Trace.

Example:

```js
span.debug("access_log", {"uri": "/login", "username": "zhou78620051@126.com", "ip": "127.0.0.1"});
span.info("db_log", {"username": "zhou78620051@126.com", "lastIp": "192.168.18.188"});
span.warn("ip_changed", {"username": "zhou78620051@126.com", "lastIp": "192.168.18.188", "ip": "127.0.0.1"});
span.error("password_wrong", {"username": "zhou78620051@126.com", "checkpass": false});
```

**span.finish()**

Finish The Span, And Send Data To Jaeger Agent. After `.finish()` Called, No Futher tag Can Be Added, No More Information Can Be Logged Via `.debug()`, `.info()`, `.warn()` And `.error()`.

Example:

```js
span.finish();

// Won't Work After finish Called.
span.debug(...);
span.setTag(name, value);
```

**span.debugEnd(eventName, logInfo)**
**span.infoEnd(eventName, logInfo)**
**span.warnEnd(eventName, logInfo)**
**span.errorEnd(eventName, logInfo)**

`span.debugEnd()` Equals `span.debug().finish()`

More Functions: context, tracer, operationName, serviceName, setOperationName, setBaggageItem, getBaggageItem...



























































[ci-img]: https://travis-ci.com/justinchou/bearcatjs-tracer.svg?branch=master
[ci]: https://travis-ci.com/justinchou/bearcatjs-tracer
[npm-img]: https://badge.fury.io/js/bearcatjs-tracer.svg
[npm]: https://www.npmjs.com/package/bearcatjs-tracer
[bearcat-logger]: https://github.com/justinchou/bearcatjs-logger
