'use strict';

var id;

module.exports.test = (event, context, callback) => {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = uuid();
  }

  let duration = JSON.parse(event.body).duration;
  while (Date.now() < start + duration) {}

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      duration: Date.now() - start,
      id: id
    })
  });
};

function uuid(a) {
  return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
}