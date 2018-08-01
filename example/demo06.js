const Tracer = require("../lib/Tracer");


let evt, data = {}, err;




// Pretend Process A

const tracer = new Tracer('ApiService');
const span = tracer.getSpan("Register").init();
 
// Add Tags
span.addTags({"uid":1234, "email": "zhou78620051@126.com"});

evt = "register-dberr";
err = new Error("invalid options");
span.error(evt, err);

evt = "register-invalid-params"
err = {email: "zhou78620051#126.com", passwd: "0123456789"};
span.warn(evt, err);

evt = "register-email";
data = "zhou78620051@126.com";
span.info(evt, data);

evt = "register-spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
span.debugEnd(evt, data);

span.inject(data);
// console.log(data);




// Pretend Sending Data....




// Pretend Process B

const subTracer = new Tracer();
const subSpan = subTracer.getSpan("SubRegister").childOf(data);

// This Won't Work, For Only The Very Original Span Works
span.addTags({"txHash": "0x1234"});

evt = "sub-register-spx";
data = {...data, txHash: "0x1234"};
subSpan.infoEnd(evt, data);

subSpan.inject(data);
// console.log(data);




// Pretend Sending Data....




// Pretend Process C

const refTracer = new Tracer();
const refSpan = subTracer.getSpan("RefRegister").followsFrom(data);

evt = "ref-register-spx";
data = {...data, logInfo: {txHash: "0x234"}};
refSpan.infoEnd(evt, data);
