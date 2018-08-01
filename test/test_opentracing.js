const JaegerClient = require('jaeger-client');
const opentracing = JaegerClient.opentracing;

console.log(Object.keys(opentracing));

[ 'BinaryCarrier',
  'Reference',
  'SpanContext',
  'Span',
  'Tracer',
  'Tags',
  'FORMAT_BINARY',
  'FORMAT_TEXT_MAP',
  'FORMAT_HTTP_HEADERS',
  'REFERENCE_CHILD_OF',
  'REFERENCE_FOLLOWS_FROM',
  'childOf',
  'followsFrom',
  'initGlobalTracer',
  'globalTracer',
  'default' 
].forEach(k => {
  console.log("%s =>", k, opentracing[k]);
});
