'use strict';

var id;

module.exports.test = (event, context, callback) => {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = event.id;
  }

  while (Date.now() < start + event.duration) {}

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      duration: Date.now() - start,
      id: id
    })
  });
};
