const Tracer = require("../lib/Tracer");


let evt, data, err;




// Pretend Process A

const tracer = new Tracer('ApiService');
const span = tracer.getSpan("Register").init();

evt = "register_dberr";
err = new Error("invalid options");
span.error(evt, err);

evt = "register_invalid_params"
err = {email: "zhou78620051#126.com", passwd: "0123456789"};
span.warn(evt, err);

evt = "register_email";
data = "zhou78620051@126.com";
span.info(evt, data);

evt = "register_spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
span.debugEnd(evt, data);


span.inject(data);
// console.log(data);




// Pretend Sending Data....




// Pretend Process B

let subData;

const subTracer = new Tracer();
const subSpan = subTracer.getSpan("SubRegister").childOf(data);

evt = "sub_register_spx";
subData = {...data, txHash: "0x1234"};
subSpan.infoEnd(evt, subData);

