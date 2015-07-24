var express = require('express');
var routes = require('./routes');
var partida = require('./routes/partida');
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))
 
app.use(bodyParser.json())

app.get('/', routes.index);
app.get('/partida/:id(\\d+)/', partida.index);

/*
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
*/

var server = http.createServer(app); 
var io = require('socket.io')(server);

var sala = new partidas.Sala(io);
sala.crear_partida('0', 'General - 2 Jugadores', 2);
sala.crear_partida('1', 'General - 4 Jugadores', 4);
sala.crear_partida('2', 'General - 6 Jugadores', 6);

function main_loop() {
    sala.bucle();
    setTimeout(function(){
        process.nextTick(main_loop);
    }, 1000);
}

process.nextTick(main_loop);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

/*
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});