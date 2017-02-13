'use strict';

function test(params) {
  var start = Date.now();
  while (Date.now() < start + params.duration) {}
  return { duration: Date.now() - start };
}

exports.test = test;
