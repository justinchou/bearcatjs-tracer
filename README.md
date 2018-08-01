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
  const tracer = new Tracer('ApiService');
  const span = tracer.getSpan("Register").init();
  
  // trace info 
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

### Apis

Todo In The Future.

