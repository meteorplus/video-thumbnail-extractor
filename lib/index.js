'use strict';

const exec = require('mz/child_process').execFile;
const download = require('download-cache');
const random = require('temp-path');
const assert = require('assert');
const sharp = require('sharp');
const fs = require('mz/fs');

const validate = require('./validate');

module.exports = thumbnail;

function thumbnail(video_url, tag) {
  let thumbnail;
  // TODO: make sure it's a valid frame
  const frame = tag.frame;
  const ms = tag.ms || 0;
  // get the thumbnail
  return getImage(video_url, frame, ms).then(function (_thumbnail) {
    return fs.stat(thumbnail = _thumbnail);
  }).then(function () {
    // return the entire thumbnail if you don't want to crop it
    const isTag = typeof tag.x === 'number'
      && typeof tag.y === 'number'
      && typeof tag.width === 'number'
      && typeof tag.height === 'number';
    const isResize = typeof tag.maxsize === 'number'
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
      const x = Math.round(tag.x / 100 * metadata.width);
      const y = Math.round(tag.y / 100 * metadata.height);
      const width = Math.round(tag.width / 100 * metadata.width);
      const height = Math.round(tag.height / 100 * metadata.height);

      const convert = sharp(thumbnail)
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
    const tmp = random() + '.jpg';
    return extractImageFromVideo(filename, frame, ms, tmp).then(function () {
      return tmp;
    });
  });
}

/**
 * ffmpeg command to extract the keyframe.
 */

function extractImageFromVideo(filename, frame, ms, tmp) {
  const args = [
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
