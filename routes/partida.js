var express = require('express');
var router = express.Router();
var config = require('../config');

router.use(function addConfig(req, res, next) {
  req.config = config;
  next();
});

router.get('/ordenador/:id(\\d+)/', function(req, res) {
    res.render('ordenador', { title: 'NodeTetris - Partida', req: req });
});

router.get('/:nombre/:id(\\d+)/', function(req, res) {
    res.render('partida', { title: 'NodeTetris - Partida', req: req });
});

module.exports = router;