'use strict';

var id;

function test(params) {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = params.id;
  }

  while (Date.now() < start + params.duration) {}

  return {
    duration: Date.now() - start,
    id: id
  };
}

exports.test = test;
