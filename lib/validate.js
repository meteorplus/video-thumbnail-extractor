
var assert = require('http-assert');

module.exports = function (tag, frames) {
  assert(isNumber(tag.frame), 422, '.frame must be an integer.');
  assert(tag.frame === Math.round(tag.frame), 422, '.frame must be an integer.');
  assert(tag.frame >= 0, 422, '.frame out of bounds.');

  if (frames !== undefined) assert(tag.frame <= frames, 422, '.frame out of bounds.');

  [
    'x',
    'y',
    'width',
    'height',
  ].forEach(function (key) {
    assert(key in tag, 422, '.' + key + ' must be defined.')
    assert(isNumber(tag[key]), 422, '.' + key + ' must be a valid number.');
    assert(tag[key] >= 0, 422, '.' + key + ' out of bounds.');
    assert(tag[key] <= 100, 422, '.' + key + ' out of bounds.');
  });

  assert(tag.x + tag.width <= 100, 422, 'Tag out of bounds.');
  assert(tag.y + tag.height <= 100, 422, 'Tag out of bounds.');

  return tag;
}

function isNumber(x) {
  return typeof x === 'number' && !isNaN(x) && x != null;
}
