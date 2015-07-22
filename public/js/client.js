var a_canvas = document.getElementById("mapa");
var canvas = a_canvas.getContext("2d");

var a_cansig = document.getElementById("sig");
var cansig = a_cansig.getContext("2d");

var jugador = new Jugador(canvas, cansig);
jugador.dibujar();

var oponentes = {};

/*
window.addEventListener('keypress', function(e){
    jugador.teclas(e.keyCode || e.which);
}, true);
*/

window.addEventListener('keydown', function(e){
    jugador.teclas(e.keyCode || e.which);
});

var socket = io();

socket.on('iniciar', function(datos){
    $('#titulo').html(datos.id);
    jugador.mapa.mapa = datos.mapa;
    jugador.pieza.x = datos.pieza.x;
    jugador.pieza.y = datos.pieza.y;
    jugador.pieza.pieza_actual = datos.pieza.pieza_actual;
    jugador.pieza.pieza_sig = datos.pieza.pieza_sig;
    jugador.pieza.regenerar();
    jugador.dibujar();
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

socket.on('eliminar', function(datos){
    if(datos.id in oponentes){
        $('#mapa_'+datos.id).parent().remove();
        $('#listado_oponentes').find('li.mapa_'+datos.id).remove();
        delete oponentes[datos.id];
    }
});

socket.on('comenzar', function(){
    jugador.jugando = true;
    $( "#dialog-espera" ).dialog('close');
    $( "#dialog-perdistes" ).dialog('close');
    $( "#dialog-ganastes" ).dialog('close');
});

socket.on('perder', function(){
    jugador.jugando = false;
    $( "#dialog-perdistes" ).dialog('open');
});

socket.on('ganador', function(){
    jugador.jugando = false;
    $( "#dialog-ganastes" ).dialog('open');
});

$( "#dialog-espera" ).dialog({
    resizable: false,
    draggable: false,
    closeText: "hide",
    closeOnEscape: false,
    dialogClass: 'no-close',
    modal: true,
    buttons: {
        "Preparado": function(){
            jugador.preparado = true;
            socket.emit('preparado');
            $('#dialog-espera').parent().find('button').hide();
        }
    }
});

$( "#dialog-perdistes" ).dialog({
    autoOpen: false,
    resizable: false,
    draggable: false,
    closeText: "hide",
    closeOnEscape: false,
    dialogClass: 'no-close',
    modal: true
});

$( "#dialog-ganastes" ).dialog({
    autoOpen: false,
    resizable: false,
    draggable: false,
    closeText: "hide",
    closeOnEscape: false,
    dialogClass: 'no-close',
    modal: true
});
