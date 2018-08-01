const Tracer = require("./Tracer");


let evt, data, err;


const tracer = new Tracer('ApiService');
const span = tracer.getSpan("Register").init();

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
span.infoEnd(evt, data);


const transform  = {};
span.inject(transform);
// console.log(transform);



const subTracer = new Tracer('RpcService');
const subSpan = subTracer.getSpan("Sub Register").childOf(transform);

evt = "sub_register_spx";
data = {email: "zhouzhiyu@beliefchain.com", spx: 18.88};
subSpan.infoEnd(evt, data);

