
const express = require('express')
const bodyParser = require('body-parser')
const Resource = require('./libs/Resource.js')
const restDefinition = require('./libs/restDefinition.s')

module.exports = function (options) {
  const router = express.Router()
  const resource = new Resource(options)

  router.use(bodyParser.json())

  restDefinition.forEach(function (route) {
    router[route.method](route.path, resource[route.method]())
  })

  return router
}
