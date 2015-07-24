
/*
 * GET users listing.
 */

exports.index = function(req, res){
  res.render('partida', { title: 'Partida', id: req.params.id });
};