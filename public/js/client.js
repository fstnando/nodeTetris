var a_canvas = document.getElementById("pantalla");
var canvas = a_canvas.getContext("2d");

var jugador = new Jugador(a_canvas, canvas);
jugador.mapa.set_mapa_loco();

var pos = 0;

jugador.mensaje = 'Iniciando';

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
            if(jugador.mover_iz())
                jugador.socket.emit('mover_iz');
        },
        swipeRight: function(event, direction, distance, duration, fingerCount){
            if(jugador.mover_de())
                jugador.socket.emit('mover_de');
        },
        swipeUp: function(event, direction, distance, duration, fingerCount){
            if(jugador.rotar_iz())
                jugador.socket.emit('rotar_iz');
        },
        swipeDown: function(event, direction, distance, duration, fingerCount){
            jugador.bajar();
            jugador.socket.emit('bajar');
        }
    });
    
    Mouse.update = function(){
        var x = Math.round(Mouse.lx / Mouse.tam);
        var y = Math.round(Mouse.ly / Mouse.tam);
        while(x>0){
            if(jugador.mover_de())
                jugador.socket.emit('mover_de');
            x-=1;
        }
        while(x<0){
            if(jugador.mover_iz())
                jugador.socket.emit('mover_iz');
            x+=1;
        }
        if(y>0){
            jugador.bajar();
            jugador.socket.emit('bajar');
        }
        if(y<0){
            if(jugador.rotar_iz())
                jugador.socket.emit('rotar_iz');
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
			//$('#esperando').html('Comenzando en: ' + tiempo);
            jugador.mensaje = tiempo;
            jugador.ipantalla.dibujar();
	    });
	    
	    socket.on('estado', function(estado){
			//$('#estado').html(estado);
            jugador.estado = estado;
            jugador.ipantalla.dibujar();
	    });
	    
	    //	Eventos del Juego

	    socket.on('iniciar', function(datos){
	    	$('#estado').html('Jugando');
            $('#esperando').html('');
            jugador.mensaje = '';
            jugador.estado = '';
	        jugador.reset();
	        jugador.mapa.mapa = datos.mapa;
	        jugador.pieza.x = datos.pieza.x;
	        jugador.pieza.y = datos.pieza.y;
	        jugador.pieza.pieza_actual = datos.pieza.pieza_actual;
	        jugador.pieza.pieza_sig = datos.pieza.pieza_sig;
	        jugador.pieza.regenerar();
	        jugador.dibujar();
	    	jugador.jugando = true;
	    });

	    socket.on('corregir', function(datos){
	        jugador.mapa.mapa = datos.mapa;
	        jugador.pieza.x = datos.pieza.x;
	        jugador.pieza.y = datos.pieza.y;
	        jugador.pieza.pieza_actual = datos.pieza.pieza_actual;
	        jugador.pieza.pieza_sig = datos.pieza.pieza_sig;
	        jugador.pieza.regenerar();
	        jugador.dibujar();
	    });

	    socket.on('mover_ab', function(){
	        if(!jugador.mover_ab())
	            jugador.nueva_linea()
	        jugador.dibujar();
	    });

	    socket.on('pieza_sig', function(pieza_sig){
	        jugador.pieza.pieza_sig.push(pieza_sig);
	    });

	    socket.on('recibir_lineas', function(lineas_enviar){
	        jugador.mapa.insertar_lineas(lineas_enviar);
	        jugador.dibujar();
	    });

	    socket.on('mapa', function(datos){
	        if(!(datos.id in jugador.oponentes)){
	            var mapa = new Mapa();
	            mapa.mapa = datos.mapa;
	            jugador.oponentes[datos.id] = {
	                'mapa': mapa,
	                'pos': pos
	            };
                pos += 1;
	        }
	        jugador.oponentes[datos.id].mapa.mapa = datos.mapa;
	        jugador.dibujar();
	    });

	    socket.on('eliminar', function(id){
	        if(id in jugador.oponentes){
	            delete jugador.oponentes[id];
	        }
	    });

	    socket.on('comenzar', function(){
	        jugador.jugando = true;
            jugador.mensaje = '';
            jugador.estado = '';
	    });

	    socket.on('perder', function(){
	    	//$('#estado').html('Perdiste!!!');
            jugador.estado = 'Perdiste';
	        jugador.jugando = false;
            jugador.ipantalla.dibujar();
	    });

	    socket.on('ganador', function(){
	    	//$('#estado').html('Ganaste!!!');
            jugador.estado = 'Ganaste';
	        jugador.jugando = false;
            jugador.ipantalla.dibujar();
	    });
	});
});
