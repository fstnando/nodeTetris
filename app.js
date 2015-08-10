var config = require('./config');
var express = require('express');
var routes = require('./routes/index');
var partida = require('./routes/partida');
var birds = require('./routes/birds');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var errorHandler = require('errorhandler');
var path = require('path');
var partidas = require('./lib/partidas');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({ resave: true,
    saveUninitialized: true,
    secret: 'dguib35' }));
app.use(config.path, express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))
 
app.use(bodyParser.json())

app.get(config.path + '/socket.io/socket.io.js',function(req,res) {
    res.sendfile(path.join(__dirname, 'node_modules', 'socket.io', 'node_modules', 'socket.io-client', 'socket.io.js'));
});

app.use(config.path + '/', routes);
app.use(config.path + '/partida', partida);
app.use(config.path + '/birds', birds);
app.get(config.path + '/:name(\\w+)/', function(req, res) {
    res.send(req.params.name);
});


/*
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
*/

var server = http.createServer(app); 
var io = require('socket.io')(server, { pingTimeout: 5000, pingInterval: 5000, path: config.path + "/socket.io"});

var sala = new partidas.Sala(io);
sala.crear_partida('0', 'General - 2 Jugadores', 2);
sala.crear_partida('1', 'General - 4 Jugadores', 4);
sala.crear_partida('2', 'General - 6 Jugadores', 6);
var p4 = sala.crear_partida('3', 'Masa - 1 Jugadores - 1 IA', 2);
var p5 = sala.crear_partida('4', 'Masa - 4 Jugadores - 2 IA', 6);

p4.crear_jugador_ia('Meringo');

p5.crear_jugador_ia('NatSuMa');
p5.crear_jugador_ia('Pedro');


function main_loop() {
    sala.bucle();
    setTimeout(function(){
        process.nextTick(main_loop);
    }, 100);
}

process.nextTick(main_loop);

/*
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/

server.listen(config.server_port, config.server_ip_address, function () {
    console.log( "Listening on " + config.server_ip_address + ", server_port " + config.server_port )
});