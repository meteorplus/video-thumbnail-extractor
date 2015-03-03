
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
  // TODO: make sure it's a valid frame
  var frame = tag.frame;
  var ms = tag.ms || 0;
  // get the thumbnail
  return getImage(video_url, frame, ms).then(function (_thumbnail) {
    return fs.stat(thumbnail = _thumbnail);
  }).then(function () {
    // return the entire thumbnail if you don't want to crop it
    var isTag = typeof tag.x === 'number'
      && typeof tag.y === 'number'
      && typeof tag.width === 'number'
      && typeof tag.height === 'number';
    var isResize = typeof tag.maxsize === 'number'
      && (tag.maxsize = Math.round(tag.maxsize));

    if (!isTag && !isResize) return fs.createReadStream(thumbnail);

    if (!isTag && isResize) {
      return sharp(thumbnail)
        .sequentialRead()
        .resize(tag.maxsize, tag.maxsize)
        .max()
        .withoutEnlargement()
        .jpeg();
    }

    tag = validate(tag);
    return sharp(thumbnail).metadata().then(function (metadata) {
      var x = Math.round(tag.x / 100 * metadata.width);
      var y = Math.round(tag.y / 100 * metadata.height);
      var width = Math.round(tag.width / 100 * metadata.width);
      var height = Math.round(tag.height / 100 * metadata.height);

      var convert = sharp(thumbnail)
        .sequentialRead()
        .extract(y, x, width, height);

      if (isResize) convert
        .resize(tag.maxsize, tag.maxsize)
        .max()
        .withoutEnlargement();

      return convert.jpeg();
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
  }).catch(/* istanbul ignore next */ function (err) {
    if (err.code === 'ENOENT') err.status = 404;
    throw err;
  })
}

/**
 * Download the video and extract the thumbnail.
 */

function getImage(video_url, frame, ms) {
  return download(video_url).then(function (filename) {
    var tmp = random() + '.jpg';
    return extractImageFromVideo(filename, frame, ms, tmp).then(function () {
      return tmp;
    });
  });
}

/**
 * ffmpeg command to extract the keyframe.
 */

function extractImageFromVideo(filename, frame, ms, tmp) {
  var args = [
    '-i', filename,
    // ffmpeg's frame indexes start at 1
    '-vframes', '1',
  ];
  if (typeof frame === 'number') {
    args.push('-vf', 'select=eq(n\\,' + (frame + 1) + ')');
  } else {
    args.push('-ss', String((ms || 0) / 1000));
  }
  return exec('ffmpeg', args.concat(tmp));
}
