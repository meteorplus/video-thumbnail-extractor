
var exec = require('mz/child_process').execFile;
var download = require('download-cache');
var random = require('temp-path');
var assert = require('assert');
var sharp = require('sharp');
var fs = require('mz/fs');

var validate = require('./validate');

module.exports = thumbnail;

function thumbnail(video_url, tag) {
  var thumbnail;
  var frame = tag.frame;
  // TODO: make sure it's a valid frame
  assert(typeof frame === 'number');
  // get the thumbnail
  return getImage(video_url, frame).then(function (_thumbnail) {
    thumbnail = _thumbnail;
    // return the entire thumbnail if you don't want to crop it
    if (typeof tag.x !== 'number'
      || typeof tag.y !== 'number'
      || typeof tag.width !== 'number'
      || typeof tag.height !== 'number')
      return fs.createReadStream(thumbnail);

    tag = validate(tag);
    return sharp(thumbnail).metadata().then(function (metadata) {
      var x = Math.round(tag.x / 100 * metadata.width);
      var y = Math.round(tag.y / 100 * metadata.height);
      var width = Math.round(tag.width / 100 * metadata.width);
      var height = Math.round(tag.height / 100 * metadata.height);
      return extractImage(thumbnail, x, y, width, height);
    });
  }).then(function (stream) {
    // always delete the stream after using it
    stream.on('error', unlink);
    stream.on('close', unlink);
    stream.on('end', unlink);

    return stream;

    function unlink() {
      fs.unlink(thumbnail);
    }
  })
}

/**
 * Extract the image portion using libvips.
 */

function extractImage(filename, x, y, width, height) {
  return sharp(filename)
    .sequentialRead()
    .extract(y, x, width, height)
    .jpeg();
}

/**
 * Download the video and extract the thumbnail.
 */

function getImage(video_url, frame) {
  return download(video_url).then(function (filename) {
    var tmp = random() + '.jpg';
    return extractImageFromVideo(filename, frame, tmp).then(function () {
      return tmp;
    });
  });
}

/**
 * ffmpeg command to extract the keyframe.
 */

function extractImageFromVideo(filename, frame, tmp) {
  return exec('ffmpeg', [
    '-i', filename,
    // ffmpeg's frame indexes start at 1
    '-vf', 'select=eq(n\\,' + (frame + 1) + ')',
    '-vframes', '1',
    tmp,
  ]);
}
