var a_canvas = document.getElementById("pantalla");
var canvas = a_canvas.getContext("2d");

var jugador = new Jugador(a_canvas, canvas);
jugador.mapa.set_mapa_loco();

var pos = 0;

$(window).resize(function() {
    jugador.ipantalla.configurar();
});
jugador.ipantalla.configurar();

window.addEventListener('keydown', function(e){
    jugador.teclas(e.keyCode || e.which);
});

$(document).ready(function(){
    var socket = io(':' + client_port + '/partida' + id_pagina, {path: server_path + "/socket.io"});
    jugador.socket = socket;
    //jugador.jugando = true;

    $(document).swipe( {
        swipeLeft: function(event, direction, distance, duration, fingerCount){
            if(jugador.mover_iz()){
                jugador.socket.emit('mover_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
            jugador.dibujar();
        },
        swipeRight: function(event, direction, distance, duration, fingerCount){
            if(jugador.mover_de()){
                jugador.socket.emit('mover_de', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
            jugador.dibujar();
        },
        swipeUp: function(event, direction, distance, duration, fingerCount){
            if(jugador.rotar_iz()){
                jugador.socket.emit('rotar_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
            jugador.dibujar();
        },
        swipeDown: function(event, direction, distance, duration, fingerCount){
            jugador.bajar();
            jugador.socket.emit('bajar', jugador.tiempo, jugador.pieza);
            jugador.tiempo++;
            jugador.dibujar();
        }
    });
    
    Mouse.update = function(){
        var x = Math.round(Mouse.lx / Mouse.tam);
        var y = Math.round(Mouse.ly / Mouse.tam);
        while(x>0){
            if(jugador.mover_de()){
                jugador.socket.emit('mover_de', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
            x-=1;
        }
        while(x<0){
            if(jugador.mover_iz()){
                jugador.socket.emit('mover_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
            x+=1;
        }
        if(y>0){
            jugador.bajar();
            jugador.socket.emit('bajar', jugador.tiempo, jugador.pieza);
            jugador.tiempo++;
        }
        if(y<0){
            if(jugador.rotar_iz()){
                jugador.socket.emit('rotar_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
            }
        }
        jugador.dibujar();
    }

    socket.on('connect', function () {
        $('#id_nombre').html(socket.id);
        
        //	Eventos de la partida
        
        socket.on('partida_completa', function(){
            alert('Partida Completa');
            window.location.assign('/');
        });
        
        socket.on('esperando', function(tiempo){
            jugador.mensaje = tiempo;
            jugador.ipantalla.dibujar();
        });
        
        socket.on('estado', function(estado){
            jugador.estado = estado;
            jugador.ipantalla.dibujar();
        });
        
        //	Eventos del Juego

        socket.on('iniciar', function(datos){
            jugador.mensaje = '';
            jugador.estado = null;
            //jugador.reset();
            jugador.mapa.mapa = datos.mapa;
            jugador.pieza.x = datos.pieza.x;
            jugador.pieza.y = datos.pieza.y;
            jugador.pieza.rot = datos.pieza.rot;
            jugador.pieza.pieza_actual = datos.pieza.pieza_actual;
            jugador.pieza.pieza_sig = datos.pieza.pieza_sig;
            jugador.pieza.regenerar();
            jugador.dibujar();
            jugador.jugando = true;
            jugador.tiempo = datos.tiempo;
            delete datos;
        });

        socket.on('corregir', function(datos){
            jugador.mapa.mapa = datos.mapa;
            jugador.pieza.x = datos.pieza.x;
            jugador.pieza.y = datos.pieza.y;
            jugador.pieza.rot = datos.pieza.rot;
            jugador.pieza.pieza_actual = datos.pieza.pieza_actual;
            jugador.pieza.pieza_sig = datos.pieza.pieza_sig;
            jugador.pieza.regenerar();
            jugador.tiempo = datos.tiempo;
            jugador.dibujar();
            delete datos;
        });

        socket.on('mover_ab', function(){
            if(!jugador.mover_ab())
                jugador.nueva_linea()
            jugador.dibujar();
        });

        socket.on('pieza_sig', function(pieza_sig){
            jugador.pieza.pieza_sig.push(pieza_sig);
            jugador.lineas_enviar = [];
        });

        socket.on('recibir_lineas', function(lineas_recibir){
            jugador.lineas_recibir = lineas_recibir;
            jugador.dibujar();
        });
        
        socket.on('oponentes', function(oponentes){
            delete oponentes[socket.id];
            jugador.oponentes = oponentes;
            jugador.ipantalla.dibujar_oponentes();
        });

        socket.on('eliminar', function(id){
            if(id in jugador.oponentes){
                delete jugador.oponentes[id];
            }
        });

        socket.on('comenzar', function(){
            jugador.jugando = true;
            jugador.mensaje = '';
            jugador.estado = null;
        });

        socket.on('perder', function(){
            jugador.estado = 3;
            jugador.jugando = false;
            jugador.ipantalla.dibujar();
        });

        socket.on('ganador', function(){
            jugador.estado = 2;
            jugador.jugando = false;
            jugador.ipantalla.dibujar();
        });
    });
});
