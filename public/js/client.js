var a_canvas = document.getElementById("mapa");
var canvas = a_canvas.getContext("2d");

var a_cansig = document.getElementById("sig");
var cansig = a_cansig.getContext("2d");

var jugador = new Jugador(canvas, cansig);
jugador.dibujar();

var oponentes = {};

window.addEventListener('keydown', function(e){
    jugador.teclas(e.keyCode || e.which);
});

$(document).ready(function(){
	var socket = io('/partida' + id_pagina);
	jugador.socket = socket;
    jugador.jugando = true;
    
    Mouse.update = function(){
        var x = Math.round(Mouse.lx / (jugador.imapa.tam * 2));
        var y = Math.round(Mouse.ly / (jugador.imapa.tam * 2));
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
	    
	    $('#id_nombre').click(function(){
	        $('#dialog-jugador').dialog('open');
	    });
	    
	    $('#cambiar_nombre').click(function(){
	        $('#dialog-jugador').dialog('open');
	        return false;
	    });
	    
	    //	Eventos de la partida
	    
	    socket.on('partida_completa', function(){
	    	alert('Partida Completa');
	        window.location.assign('/');
	    });
	    
	    socket.on('esperando', function(tiempo){
			$('#esperando').html('Comenzando en: ' + tiempo);
	    });
	    
	    socket.on('estado', function(estado){
			$('#estado').html(estado);
	    });
	    
	    //	Eventos del Juego

	    socket.on('iniciar', function(datos){
	    	$('#estado').html('Jugando');
            $('#esperando').html('');
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
	        if(!(datos.id in oponentes)){
	            $('#op').append('<div class="ladrillo flotante"><canvas id="mapa_'+datos.id+'" class="fondo_verde espacio" width="100" height="250"></canvas></div>');
	            var op = $('#mapa_'+datos.id);
	            var canvas = op[0].getContext("2d");
	            var mapa = new Mapa();
	            mapa.mapa = datos.mapa;
	            var imapa = new IMapa(canvas, mapa);
	            imapa.tam = 10;
	            oponentes[datos.id] = {
	                'canvas': canvas,
	                'mapa': mapa,
	                'imapa': imapa
	            };
	            var el = $('#listado_oponentes').find('li.mapa_'+datos.id);
	            if(el.length == 0){
	                $('#listado_oponentes').append('<li class="mapa_'+datos.id+'">'+datos.id+'</li>');
	            }
	        }
	        oponentes[datos.id].mapa.mapa = datos.mapa;
	        oponentes[datos.id].imapa.dibujar();
	    });

	    socket.on('eliminar', function(id){
	        if(id in oponentes){
	            $('#mapa_'+id).parent().remove();
	            $('#listado_oponentes').find('li.mapa_'+id).remove();
	            delete oponentes[id];
	        }
	    });

	    socket.on('comenzar', function(){
	        jugador.jugando = true;
	        $( "#dialog-perdistes" ).dialog('close');
	        $( "#dialog-ganastes" ).dialog('close');
	    });

	    socket.on('perder', function(){
	    	$('#estado').html('Perdiste!!!');
	        jugador.jugando = false;
	    });

	    socket.on('ganador', function(){
	    	$('#estado').html('Ganaste!!!');
	        jugador.jugando = false;
	    });
	});
	dialog = $( "#dialog-jugador" ).dialog({
	  autoOpen: false,
	  modal: true,
	  buttons: {
	    "Aceptar": function(){
	        var nombre = $('#nombre').val();
	        $('#id_nombre').html(nombre);
	        socket.emit('set_nombre', nombre);
	        dialog.dialog( "close" );
	    }
	  }
	});
});
