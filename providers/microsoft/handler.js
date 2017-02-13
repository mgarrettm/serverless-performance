'use strict';

module.exports.test = function (context, req) {
    var start = Date.now();
    while (Date.now() < start + req.body.duration) {}
    context.done(null, { body: { duration: Date.now() - start } });
};