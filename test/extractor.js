
var assert = require('assert');
var sharp = require('sharp');

var extract = require('..');

var img = 'https://archive.org/download/Windows7WildlifeSampleVideo/Wildlife_512kb.mp4';

it('should create a thumbnail for an image', function (done) {
  extract(img, {
    frame: 0
  }).then(function (stream) {
    return stream.pipe(sharp()).metadata();
  }).then(function (metadata) {
    assert(metadata.width === 416);
    assert(metadata.height === 240);
    assert(metadata.format === 'jpeg');
  }).then(done, done)
})

it('should extract an image', function (done) {
  extract(img, {
    frame: 0,
    x: 10,
    y: 10,
    width: 10,
    height: 10
  }).then(function (stream) {
    return stream.pipe(sharp()).metadata();
  }).then(function (metadata) {
    assert(metadata.width === 42);
    assert(metadata.height === 24);
    assert(metadata.format === 'jpeg');
  }).then(done, done)
})
