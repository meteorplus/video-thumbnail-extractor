
# video-thumbnail-extractor

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

Dynamically extract thumbnails and tags from an image.

## GET /:url?frame=&x=&y=&width=&height=

`url` should be `encodeURIComponent`ed.
`frame` defaults to `0`.
`x`, `y`, `width`, and `height` must all be defined to be valid.
Returns a `jpeg` image.

## GET /:encryptedUrl?frame=&x=&y=&width=&height=

Same as above, but with encrypting the URLs instead of encoding.
This is so people don't know the original video URL as well as not allow arbitrary videos.
Here's how to encrypt a URL:

```js
var crypto = require('crypto');

var hostname = 'http://localhost:3000';
var password = 'some-password-you-set';

function encrypt(url) {
  var cipher = crypto.createCipher('aes256', password);
  var buffers = [];
  buffers.push(cipher.update(url));
  buffers.push(cipher.final());
  return hostname + '/' + Buffer.concat(buffers).toString('hex');
}
```

Now accessing `encrypt(url) + '?frame=' + index` will return the image at a specific index.

[gitter-image]: https://badges.gitter.im/mgmtio/video-thumbnail-extractor.png
[gitter-url]: https://gitter.im/mgmtio/video-thumbnail-extractor
[npm-image]: https://img.shields.io/npm/v/video-thumbnail-extractor.svg?style=flat-square
[npm-url]: https://npmjs.org/package/video-thumbnail-extractor
[github-tag]: http://img.shields.io/github/tag/mgmtio/video-thumbnail-extractor.svg?style=flat-square
[github-url]: https://github.com/mgmtio/video-thumbnail-extractor/tags
[travis-image]: https://img.shields.io/travis/mgmtio/video-thumbnail-extractor.svg?style=flat-square
[travis-url]: https://travis-ci.org/mgmtio/video-thumbnail-extractor
[coveralls-image]: https://img.shields.io/coveralls/mgmtio/video-thumbnail-extractor.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/mgmtio/video-thumbnail-extractor
[david-image]: http://img.shields.io/david/mgmtio/video-thumbnail-extractor.svg?style=flat-square
[david-url]: https://david-dm.org/mgmtio/video-thumbnail-extractor
[license-image]: http://img.shields.io/npm/l/video-thumbnail-extractor.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/video-thumbnail-extractor.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/video-thumbnail-extractor
[gittip-image]: https://img.shields.io/gratipay/jonathanong.svg?style=flat-square
[gittip-url]: https://gratipay.com/jonathanong/
