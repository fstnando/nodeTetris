var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var jugadores = {};
var comienzo = false;

app.use(express.static('public'));

function nueva_pieza(obj){
    var pieza_sig = entreAB(0, 6);
    obj.jugador.pieza.pieza_sig.push(pieza_sig);
    obj.socket.emit('pieza_sig', pieza_sig);
    if(!obj.jugador.mapa.pieza_valida(obj.jugador.pieza)){
        obj.jugador.jugando = false;
        obj.socket.emit('perder');
        comprobar_ganador();
    }
}

function comprobar_ganador(){
    var ganadores = [];
    for(i in jugadores){
        if(jugadores[i].jugador.jugando)
            ganadores.push(jugadores[i]);
    }
    if(ganadores.length==1){
        ganadores[0].socket.emit('ganador');
        comienzo = false;
    }
}

function comprobar_lineas(obj){
    if(obj.jugador.lineas_enviar.length>0){
        for(i in jugadores){
            if(obj!=jugadores[i]){
                jugadores[i].jugador.mapa.insertar_lineas(obj.jugador.lineas_enviar);
                jugadores[i].socket.emit('recibir_lineas', obj.jugador.lineas_enviar);
            }
        }
        obj.jugador.lineas_enviar = [];
    }
}

io.on('connection', function(socket){
    var patt = /sessionid=(\w+)/;
    var found = socket.client.request.headers.cookie.match(patt);
    var sessionid;
    if(found){
        sessionid = found[1];
        console.log(sessionid);
        if(!(socket.id in jugadores)){
            var jugador = new Jugador(null, null);
            jugador.mapa.set_mapa_loco();
            jugadores[socket.id] = {'jugador': jugador, 'socket': socket};
            console.log("Nuevo usuario: " + socket.id);
        }else{
            var jugador = jugadores[socket.id];
        }
        socket.emit('iniciar', {'id': socket.id, 'mapa': jugador.mapa.mapa, 'pieza': jugador.pieza});
        socket.on('mover_iz', function(){
            if(!jugadores[this.id].jugador.mover_iz())
                socket.broadcast.emit('corregir', {'mapa': jugadores[this.id].jugador.mapa.mapa, 'pieza': jugadores[this.id].jugador.pieza});
        });
        socket.on('mover_de', function(){
            if(!jugadores[this.id].jugador.mover_de())
                socket.broadcast.emit('corregir', {'mapa': jugadores[this.id].jugador.mapa.mapa, 'pieza': jugadores[this.id].jugador.pieza});
        });
        socket.on('rotar_iz', function(){
            if(!jugadores[this.id].jugador.rotar_iz())
                socket.broadcast.emit('corregir', {'mapa': jugadores[this.id].jugador.mapa.mapa, 'pieza': jugadores[this.id].jugador.pieza});
        });
        socket.on('mover_ab', function(){
            if(!jugadores[this.id].jugador.mover_ab())
                socket.broadcast.emit('corregir', {'mapa': jugadores[this.id].jugador.mapa.mapa, 'pieza': jugadores[this.id].jugador.pieza});
        });
        socket.on('bajar', function(){
            jugadores[this.id].jugador.bajar();
            comprobar_lineas(jugadores[this.id]);
            nueva_pieza(jugadores[this.id]);
        });
        socket.on('nueva_linea', function(){
            jugadores[this.id].jugador.nueva_linea();
            comprobar_lineas(jugadores[this.id]);
            nueva_pieza(jugadores[this.id]);
        });
        socket.on('preparado', function(){
            jugadores[this.id].jugador.preparado = true;
            var preparado = true;
            for(i in jugadores){
                if(!jugadores[i].jugador.preparado){
                    preparado = false;
                    break;
                }
            }
            if(preparado){
                comienzo = true;
                for(i in jugadores){
                    jugadores[i].jugador.jugando = true;
                    jugadores[i].socket.emit('comenzar');
                }
            }
        });
        socket.on('disconnect', function(){
            delete jugadores[socket.id];
            console.log("Usuario: " + socket.id + " desconectado");
            socket.broadcast.emit('eliminar', {'id': this.id});
        });
    }
});

eval(fs.readFileSync('public/js/tetris.js')+'');
eval(fs.readFileSync('public/js/itetris.js')+'');

function main_loop() {
    comprobar_ganador();
    for(i in jugadores) {
        if(!jugadores[i].jugador.mover_ab()){
            jugadores[i].jugador.nueva_linea();
            comprobar_lineas(jugadores[i]);
            nueva_pieza(jugadores[i]);
        }
        if(comienzo)
            jugadores[i].socket.emit('mover_ab');
        var datos = {
            'id': jugadores[i].socket.id,
            'mapa': jugadores[i].jugador.mapa.mapa
        }
        jugadores[i].socket.broadcast.emit('mapa', datos);
    }
    setTimeout(function(){
        process.nextTick(main_loop);
    }, 5000);
}

process.nextTick(main_loop);

http.listen(8080, function(){
    console.log('listening on *:8080');
});
