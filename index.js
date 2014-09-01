
var express = require('express');
var bodyParser = require('body-parser')

module.exports = function (options) {

  var router = express.Router();
  router.use(bodyParser.json());

  var resource = new Resource(options);

  Object.keys(Resource.routes).forEach(function (routeName) {
    var route = Resource.routes[routeName];
    router[route.method](route.path, resource[routeName]());
  });

  return router;
};


var Resource = function (options) {

  if (! options.db) {
    throw new Error('Must provide "db" option.')
  }

  if (typeof options.db !== 'function') {
    var db = options.db;
    options.db = function () {
      return db;
    }
  }

  options.error = options.error || function (err) {
    console.error(err);
  };

  this.options = options;
};

Resource.routes = {
  'list': { method: 'get', path: '/' },
  'get': { method: 'get', path: '/:id' },
  'post': { method: 'post', path: '/' },
  'put': { method: 'put', path: '/:id' },
  'delete': { method: 'delete', path: '/:id' },
};

Resource.prototype.list = function () {
  var that = this;

  return function (req, res, next) {
    that.options.db().find({}, function (err, docs) {
      if (err) {
        that.options.error(err);
        return res.status(500);
      }
      res.json(docs);
    });
  };
};

Resource.prototype.get = function () {
  var that = this;
  
  return function (req, res, next) {
    var id = req.params.id;

    that.options.db().findOne({_id: id}, function (err, doc) {
      if (err) {
        that.options.error(err);
        return res.status(500);
      }
      if (! doc) {
        res.status(404).end();
        return;
      }
      res.json(doc);
    });
  };
};

Resource.prototype.post = function () {
  var that = this;
  
  return function (req, res, next) {
    var doc = req.body;

    that.options.db().insert(doc, function (err, newDoc) {
      if (err) {
        that.options.error(err);
        return res.status(500);
      }
      res.status(201).json(newDoc);
    });
  };
};

Resource.prototype.put = function () {
  var that = this;
  
  return function (req, res, next) {
    var id = req.params.id;
    var doc = req.body;

    that.options.db().update({_id: id}, doc, {upsert: true}, function (err, count) {
      if (err) {
        that.options.error(err);
        return res.status(500);
      }
      res.json({
        count: count
      });
    });
  };
};

Resource.prototype.delete = function () {
  var that = this;
  
  return function (req, res, next) {
    var id = req.params.id;

    that.options.db().remove({_id: id}, {}, function (err, count) {
      if (err) {
        that.options.error(err);
        return res.status(500);
      }
      res.json({
        count: count
      });
    });
  };
};