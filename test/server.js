const express = require('express')
const expressRestResource = require('../index.js')
const Nedb = require('nedb')

const app = express()
const users = new Nedb({
  timestampData: true
})

let count = 0

const config = {
  db: users,
  beforeInsert: function (data) {
    data.count = ++count
    return data
  },
  beforeSend: function (data) {
    data.id = data._id
    return data
  }
}

app.use('/api/person', expressRestResource(config))

module.exports = app
