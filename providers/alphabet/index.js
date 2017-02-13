'use strict';

exports.test = (request, response) => {
  var start = Date.now();
  while (Date.now() < start + request.body.duration) {}
  response.status(200).send({ duration: Date.now() - start })
};
