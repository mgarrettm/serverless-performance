'use strict';

var id;

exports.test = (request, response) => {
  var start = Date.now();

  if (typeof id === 'undefined') {
    id = request.body.id;
  }

  while (Date.now() < start + request.body.duration) {}

  response.status(200).send({
    duration: Date.now() - start,
    id: id
  });
};
