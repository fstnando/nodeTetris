var express = require('express');
var router = express.Router();
var config = require('../config');

router.use(function addConfig(req, res, next) {
  req.config = config;
  next();
});

router.get('/', function(req, res) {
    res.render('index', { title: 'NodeTetris', req: req });
});

module.exports = router;