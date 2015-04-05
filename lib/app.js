'use strict'

const validator = require('validator')
const Cache = require('koa-s3-cache')
const crypto = require('crypto')
const koa = require('koa')

const config = require('../config')
const extract = require('./')

const password = config.password
const cache = Cache(config)

const app = module.exports = koa()

app.use(require('koa-favicon')())
app.use(require('koa-json-error')())

app.use(function* cachingLayer(next) {
  if (yield* cache.get(this)) return

  yield* next

  yield* cache.put(this)
})

app.use(function* encrypted(next) {
  const hex = /^\/([0-9a-f]+)$/i.exec(this.path)
  if (!hex) return yield* next

  const buffers = []
  const cipher = crypto.createDecipher('aes256', password)
  buffers.push(cipher.update(new Buffer(hex[1], 'hex')))
  buffers.push(cipher.final())
  this.video_url = Buffer.concat(buffers).toString()

  yield* next
})

app.use(function* encoded(next) {
  if (this.video_url || !/^\/http/.test(this.path)) return yield* next

  this.video_url = decodeURIComponent(this.path.slice(1))

  yield* next
})

const floats = [
  'x',
  'y',
  'width',
  'height',
]

const ints = [
  'frame',
  'ms',
  'maxsize',
]

app.use(function* () {
  this.assert(this.video_url, 400, 'Video URL required.')
  this.assert(validator.isURL(this.video_url), 400, 'Invalid Video URL.')

  const query = this.query
  const options = {}

  floats.forEach(function (key) {
    if (key in query && !isNaN(query[key])) options[key] = parseFloat(query[key])
  })

  ints.forEach(function (key) {
    if (key in query && !isNaN(query[key])) options[key] = parseInt(query[key])
  })

  this.body = yield extract(this.video_url, options)
  this.type = 'image/jpeg'
  this.set('Cache-Control', 'public, max-age=32500000')
})
