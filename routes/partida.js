var express = require('express');
var router = express.Router();
var config = require('../config');

router.use(function addConfig(req, res, next) {
  req.config = config;
  next();
});

router.get('/:nombre/:id(\\d+)/', function(req, res) {
    res.render('partida', { title: 'Partida', req: req });
});

module.exports = router;