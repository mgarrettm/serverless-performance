'use strict';

var id;

module.exports.test = function (context, req) {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = req.body.id;
  }

  while (Date.now() < start + req.body.duration) {}

  context.done(null, { body: {
    duration: Date.now() - start,
    id: id
  }});
};
