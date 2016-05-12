/* global describe it beforeEach */

const request = require('supertest')
const app = require('./server.js')
const utilities = require('./testUtilities.js')

describe('Routing', function () {
  describe('Global endpoint (/slug/)', function () {
    describe('List', function () {
      it('Should respond an empty array', function (done) {
        request(app)
          .get('/api/person/')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            return res.body === []
          })
          .end(done)
      })
    })

    describe('Post', function () {
      it('Should add a person with id, createdOn and modifiedOn attributes', function (done) {
        request(app)
          .post('/api/person')
          .send({'name': 'Nicolas Pirotte'})
          .expect(201)
          .expect((res) => {
            if (res.body.name !== 'Nicolas Pirotte') {
              throw new Error(`Got ${res.body.name} name, want ${'Nicolas Pirotte'}`)
            }
          })
          .expect((res) => {
            if (!/[a-zA-Z0-9]+/.test(res.body.id)) {
              throw new Error(`Got ${res.body.id} id, not a valid id.`)
            }
          })
          .expect((res) => {
            if (typeof new Date(res.body.createdAt).valueOf() !== 'number' ||
                typeof new Date(res.body.updatedAt).valueOf() !== 'number' ||
                res.body.createdAt !== res.body.updatedAt) {
              throw new Error(`Got ${res.body.createdAt} and ${res.body.updatedAt}, not valid dates`)
            }
          })
          .end(done)
      })

      it('Should record the created element in the database', function (done) {
        const wantedNumberOfUsers = 2
        utilities.createRecords((user) => {
          request(app)
            .get('/api/person/')
            .expect('Content-Type', /json/)
            .expect((res) => {
              if (!res.body.length === wantedNumberOfUsers) {
                throw new Error(`Got ${res.body.length} element, want ${wantedNumberOfUsers}`)
              }
            })
            .end(done)
        }, wantedNumberOfUsers)
      })
    })
  })

  describe('Item end point (/slug/:id)', function () {
    let user
    beforeEach('Create 2 records', function (done) {
      utilities.createRecords((newUser) => {
        user = newUser
        done()
      }, 2)
    })

    describe('Get', function () {
      it('Should find a record by his id', function (done) {
        const id = user.id
        request(app)
          .get('/api/person/' + id)
          .expect(200)
          .expect((res) => {
            return res.body.d === id
          })
          .end(done)
      })
    })

    describe('Put', function () {
      beforeEach(function (done) {
        const id = user.id
        request(app)
          .put('/api/person/' + id)
          .send({name: 'Benjamin'})
          .expect(204)
          .end(done)
      })

      it('Should update a record', function (done) {
        const id = user.id
        request(app)
          .get('/api/person/' + id)
          .expect((res) => {
            return res.body.updatedOn === new Date()
          })
          .end(done)
      })

      it('Should set the updatedAt to the current timestamp', function (done) {
        const id = user.id
        request(app)
          .get('/api/person/' + id)
          .expect((res) => {
            if (res.body.updatedAt === res.body.createdAt || !res.body.updatedAt || !res.body.createdAt) {
              throw new Error('CreatedAd not updated !')
            }
          })
          .end(done)
      })
    })

    describe('Delete', function () {
      beforeEach(function (done) {
        const id = user.id
        request(app)
          .delete('/api/person/' + id)
          .expect(204)
          .end(done)
      })

      it('Should delete a record by his id', function (done) {
        const id = user.id
        request(app)
          .get('/api/person/' + id)
          .expect(404, done)
      })
    })
  })
})
