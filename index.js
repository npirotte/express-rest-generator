
const express = require('express')
const bodyParser = require('body-parser')
const Resource = require('./libs/Resource.js')
const restDefinition = require('./libs/restDefinition.js')

module.exports = function (options) {
  const router = express.Router()
  const resource = new Resource(options)

  router.use(bodyParser.json())

  Object.keys(restDefinition).forEach((routeName) => {
    const route = restDefinition[routeName]
    router[route.method](route.path, resource[routeName]())
  })

  return router
}
