
var request = require('supertest');
var crypto = require('crypto');
var assert = require('assert');

var password = require('../config').password;

var img = 'https://archive.org/download/Windows7WildlifeSampleVideo/Wildlife_512kb.mp4';

var server = require('../lib/app').listen();

it('GET /:url?frame=', function (done) {
  request(server)
  .get('/' + encodeURIComponent(img))
  .query({
    frame: Math.ceil(1000 * Math.random())
  })
  .expect(200)
  .expect('Content-Type', 'image/jpeg')
  .end(done);
})

it('GET /:url?ms=', function (done) {
  request(server)
  .get('/' + encodeURIComponent(img))
  .query({
    ms: Math.ceil(1000 * Math.random())
  })
  .expect(200)
  .expect('Content-Type', 'image/jpeg')
  .end(done);
})

it('GET /:encryptedUrl?frame=', function (done) {
  var cipher = crypto.createCipher('aes256', password);
  var buffers = [];
  buffers.push(cipher.update(img));
  buffers.push(cipher.final());

  request(server)
  .get('/' + Buffer.concat(buffers).toString('hex'))
  .query({
    frame: Math.ceil(1000 * Math.random())
  })
  .expect(200)
  .expect('Content-Type', 'image/jpeg')
  .end(done);
})

it.skip('GET /:encoded', function (done) {
  request(server)
  .get('/' + encodeURIComponent('http://dev1-fuiszmediavideos.s3.amazonaws.com/540e33ee24ac6f0200bb7279/540e33ee24ac6f0200bb727a.mp4?AWSAccessKeyId=AKIAJH33FGT7I3K4F5WQ&Expires=1422585559&Signature=q6XzoyKrU%2BupPr7H7yT2P2hoYW0%3D'))
  .expect(200)
  .expect('Content-Type', 'image/jpeg')
  .end(done);
})
