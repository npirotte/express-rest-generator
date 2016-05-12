/* global describe it */

const request = require('supertest')
const app = require('./server.js')

/* ==== Utilities ==== */

/**
 * Populate the database with a given number of users
 * @param {Function} cb - the callback to execute at the end. Pass the last created user as parametter.
 * @param {number} wanted - the number of users to create. Default to 1.
 */
function createUsers (cb, wanted = 1) {
  request(app)
    .post('/api/person/')
    .send({'name': 'Nicolas Pirotte'})
    .end((err, res) => {
      if (err) throw err

      if (--wanted > 0) {
        createUsers(cb, wanted)
      } else {
        cb(res.body)
      }
    })
}

describe('Routing', () => {
  describe('List', () => {
    it('Should respond an empty array', (done) => {
      request(app)
        .get('/api/person/')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          return res.body === []
        })
        .end(function (err, res) {
          if (err) throw err
          done()
        })
    })
  })

  describe('Post', () => {
    it('Should add a person with id, createdOn and modifiedOn attributes', (done) => {
      request(app)
        .post('/api/person')
        .send({'name': 'Nicolas Pirotte'})
        .expect(201)
        .expect((res) => {
          return res.body.name === 'Nicolas Pirotte'
        })
        .expect((res) => {
          return /[a-zA-Z0-9]+/.test(res.body.id)
        })
        .expect((res) => {
          const now = new Date()
          return res.body.createdOn === now && res.body.modifiedOn === now
        })
        .end(done)
    })

    it('Should record the created element in the database', (done) => {
      const wantedNumberOfUsers = 2
      createUsers((user) => {
        request(app)
            .get('/api/person/')
            .expect('Content-Type', /json/)
            .expect((res) => {
              return res.body.length === wantedNumberOfUsers
            })
            .end(function (err, res) {
              if (err) throw err
              done()
            })
      }, wantedNumberOfUsers)
    })
  })

  describe('Put', () => {
    it('Should update a record', (done) => {
      createUsers((user) => {
        const id = user.id
        request(app)
          .put('/api/person/' + id)
          .send({name: 'Benjamin'})
          .expect(204)
          .end(function (err, res) {
            if (err) throw err

            request(app)
              .get('/api/person/')
              .expect('Content-Type', /json/)
              .expect((res) => {
                return res.body[0].name === 'Benjamin'
              })
              .expect((res) => {
                return res.body[0].updatedOn === new Date()
              })
              .end(function (err, res) {
                if (err) throw err
                done()
              })
          })
      })
    })
  })

  describe('Get', () => {
    it('Should find a user by his id', (done) => {
      createUsers((user) => {
        const id = user.id
        request(app)
          .get('/api/person/' + id)
          .expect(200)
          .expect((res) => {
            return res.body.d === id
          })
          .end(done)
      }, 2)
    })
  })

  describe('Delete', () => {
    it('Should delete a user by his id', (done) => {
      createUsers((user) => {
        const id = user.id
        request(app)
          .delete('/api/person/' + id)
          .expect(204)
          .end((err, res) => {
            if (err) throw err

            request(app)
              .get('/api/person')
              .expect((res) => {
                return res.body.length === 1
              })
              .end((err, res) => {
                if (err) throw err
                done()
              })
          })
      }, 2)
    })
  })
})
