const request = require('supertest')
const app = require('./server.js')

/**
 * Populate the database with a given number of users
 * @param {Function} cb - the callback to execute at the end. Pass the last created user as parametter.
 * @param {number} wanted - the number of users to create. Default to 1.
 */
function createRecords (cb, wanted = 1) {
  request(app)
    .post('/api/person/')
    .send({'name': 'Nicolas Pirotte'})
    .end((err, res) => {
      if (err) throw err

      if (--wanted > 0) {
        createRecords(cb, wanted)
      } else {
        cb(res.body)
      }
    })
}


module.exports = {
  createRecords
}
