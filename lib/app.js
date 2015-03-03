
var validator = require('validator');
var crypto = require('crypto');
var koa = require('koa');

var password = require('../config').password;
var extract = require('./');

var app = module.exports = koa();

app.use(require('koa-favicon')());
app.use(require('koa-json-error')());

app.use(function* encrypted(next) {
  var hex = /^\/([0-9a-f]+)$/i.exec(this.path);
  if (!hex) return yield* next;

  var buffers = [];
  var cipher = crypto.createDecipher('aes256', password);
  buffers.push(cipher.update(new Buffer(hex[1], 'hex')));
  buffers.push(cipher.final());
  this.video_url = Buffer.concat(buffers).toString();

  yield* next;
});

app.use(function* encoded(next) {
  if (this.video_url || !/^\/http/.test(this.path)) return yield* next;

  this.video_url = decodeURIComponent(this.path.slice(1));

  yield* next;
});

app.use(function* () {
  this.assert(this.video_url, 400, 'Video URL required.');
  this.assert(validator.isURL(this.video_url), 400, 'Invalid Video URL.');

  var query = this.query;
  var options = {};

  [
    'x',
    'y',
    'width',
    'height',
  ].forEach(function (key) {
    if (key in query && !isNaN(query[key])) options[key] = parseFloat(query[key]);
  });

  [
    'frame',
    'ms',
    'maxsize',
  ].forEach(function (key) {
    if (key in query && !isNaN(query[key])) options[key] = parseInt(query[key]);
  });

  this.body = yield extract(this.video_url, options);
  this.type = 'image/jpeg'
  this.set('Cache-Control', 'public, max-age=32500000');
});
