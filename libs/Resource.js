/**
 * Restfull resource class
 */
class Resource {
  /**
   * @constructor
   * @param {Object} options
   */
  constructor (options) {
    if (!options.db) {
      throw new Error('Must provide "db" option.')
    }

    if (typeof options.db !== 'function') {
      let db = options.db
      options.db = function () {
        return db
      }
    }

    options.error = options.error || function (err) {
      console.error(err)
    }

    this.options = options
  }

  unsupportedMediaType (req, res) {
    if (!req.is('json')) {
      res.status(415).end()
      return true
    }
  }

  unaccepable (req, res) {
    if (!req.accepts('json')) {
      res.status(406).end()
      return true
    }
  }

  list () {
    return (req, res, next) => {
      if (this.unaccepable(req, res)) return

      this.options.db().find({}, (err, docs) => {
        if (err) {
          this.options.error(err)
          return res.status(500).end()
        }
        res.json(docs)
      })
    }
  }

  get () {
    return (req, res, next) => {
      if (this.unaccepable(req, res)) return

      var id = req.params.id

      this.options.db().findOne({_id: id}, (err, doc) => {
        if (err) {
          this.options.error(err)
          return res.status(500).end()
        }
        if (!doc) {
          res.status(404).end()
          return
        }
        res.json(doc)
      })
    }
  }

  post () {
    return (req, res, next) => {
      if (this.unsupportedMediaType(req, res)) return
      if (this.unaccepable(req, res)) return

      var doc = req.body

      this.options.db().insert(doc, function (err, newDoc) {
        if (err) {
          this.options.error(err)
          return res.status(500).end()
        }
        res.status(201).json(newDoc)
      })
    }
  }

  put () {
    return (req, res, next) => {
      if (this.unsupportedMediaType(req, res)) return
      if (this.unaccepable(req, res)) return

      var id = req.params.id
      var doc = req.body

      var query = {
        _id: id
      }

      var options = {}

      this.options.db().update(query, doc, options, (err, numReplaced) => {
        if (err) {
          this.options.error(err)
          return res.status(500).end()
        }
        if (numReplaced === 0) {
          return res.status(404).end()
        }
        res.status(204).end()
      })
    }
  }

  delete () {
    return (req, res, next) => {
      var id = req.params.id

      var query = {
        _id: id
      }

      var options = {}

      this.options.db().remove(query, options, (err, numRemoved) => {
        if (err) {
          this.options.error(err)
          return res.status(500).end()
        }
        if (numRemoved === 0) {
          return res.status(404).end()
        }
        res.status(204).end()
      })
    }
  }
}

module.exports = Resource
