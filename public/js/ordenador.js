var movida = null;

function calcularMovida(){
    var estadistica = [];
    var pieza = jugador.pieza.clonar();
    var pos_x = pieza.x;
    var pos_y = pieza.y;
    
    // Calculo de rotacion
    for(var r=0;r<4;r++){
        // Muevo la pieza hacia la izquierda
        while(jugador.mapa.pieza_valida(pieza))
            pieza.mover_iz();
        pieza.mover_de();
        
        while(jugador.mapa.pieza_valida(pieza)){
            var pos_y = pieza.y;
            while(jugador.mapa.pieza_valida(pieza))
                pieza.mover_ab();
            pieza.mover_ar();
            jugador.mapa.marcar_pieza(pieza);
            estadistica.push([pieza.x, r, jugador.mapa.estadistica()]);
            jugador.mapa.desmarcar_pieza(pieza);
            
            pieza.y = pos_y;
            pieza.mover_de();
        }
        
        pieza.x = pos_x;
        pieza.rotar_iz();
    }
    
    var mejor = 0;
    for(i=1;i<estadistica.length;i++){
        if(estadistica[i][2][0]>estadistica[mejor][2][0] || 
            (estadistica[i][2][0] == estadistica[mejor][2][0] &&
                estadistica[i][2][1] < estadistica[mejor][2][1]) ||
            (estadistica[i][2][0] == estadistica[mejor][2][0] &&
                estadistica[i][2][1] == estadistica[mejor][2][1] &&
                estadistica[i][2][2] < estadistica[mejor][2][2]))
            mejor = i;
    }
    /*
    console.log("Estadisticas");
    console.log(estadistica);
    console.log("Mejor");
    console.log(estadistica[mejor]);
    */
    return estadistica[mejor];
}

function IAOrdenador(){
    if(jugador.jugando){
        var movida = calcularMovida();
        
        if(jugador.pieza.rot<movida[1]){
            if(jugador.rotar_iz()){
                jugador.socket.emit('rotar_iz');
                jugador.dibujar();
            }
        }else
        if(jugador.pieza.x>movida[0]){
            if(jugador.mover_iz()){
                jugador.socket.emit('mover_iz');
                jugador.dibujar();
            }
        }else
        if(jugador.pieza.x<movida[0]){
            if(jugador.mover_de()){
                jugador.socket.emit('mover_de');
                jugador.dibujar();
            }
        }else{
            jugador.bajar();
            jugador.socket.emit('bajar');
            jugador.dibujar();
            var movida = null;
            var rot = 0;
        }
    }
    setTimeout('IAOrdenador()', 100);
}

setTimeout('IAOrdenador()', 100);
