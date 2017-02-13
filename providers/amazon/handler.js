'use strict';

module.exports.test = (event, context, callback) => {
  var start = Date.now();
  while (Date.now() < start + event.duration) {}
  callback(null, { statusCode: 200, body: JSON.stringify({ duration: Date.now() - start }) });
};
