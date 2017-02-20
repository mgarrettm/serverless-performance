'use strict';

var id;

module.exports = function (input) {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = uuid();
  }

  while (Date.now() < start + input.duration) {}

  return {
    duration: Date.now() - start,
    id: id
  };
};

function uuid(a) {
  return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
}
