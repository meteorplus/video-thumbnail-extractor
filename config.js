'use strict'

exports.password = process.env.PASSWORD || 'mgmt'

// s3 credentials
exports.key = process.env.EXTRACTOR_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
exports.secret = process.env.EXTRACTOR_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
exports.bucket = process.env.EXTRACTOR_BUCKET || process.env.BUCKET
