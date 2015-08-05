function comparar_est(est1, est2){
    if(est1[0]>est2[0] || 
        (est1[0] == est2[0] &&
            est1[1] < est2[1]) ||
        (est1[0] == est2[0] &&
            est1[1] == est2[1] &&
            est1[2] < est2[2]))
        return false;
    else
        return true;
}

function calcular_movida_rec(lista, mapa){
    if(lista.length > 0){
        var estadistica = -1;
        var pieza = lista[0].clonar();
        var pos_x = pieza.x;
        var pos_y = pieza.y;
        
        // Calculo de rotacion
        for(var r=0;r<4;r++){
            // Muevo la pieza hacia la izquierda
            while(mapa.pieza_valida(pieza))
                pieza.mover_iz();
            pieza.mover_de();

            while(mapa.pieza_valida(pieza)){
                while(mapa.pieza_valida(pieza))
                    pieza.mover_ab();
                pieza.mover_ar();

                mapa.marcar_pieza(pieza);
                var new_est = calcular_movida_rec(lista.slice(1), mapa);
                if(estadistica < 0 || comparar_est(estadistica, new_est)){
                    estadistica = new_est;
                }
                delete new_est;
                mapa.desmarcar_pieza(pieza);
                
                pieza.y = pos_y;
                pieza.mover_de();
            }
            
            pieza.x = pos_x;
            pieza.rotar_iz();
        }
        delete pieza;
        delete pos_x;
        delete pos_y;
        delete r;
        
        return estadistica;
    }else
        return mapa.estadistica();
    delete estadistica;
}

function calcular_movida(lista, mapa){
    var movimientos = -1;
    var pieza = lista[0].clonar();
    var pos_x = pieza.x;
    var pos_y = pieza.y;
        
    // Calculo de rotacion
    for(var r=0;r<4;r++){
        // Muevo la pieza hacia la izquierda
        while(mapa.pieza_valida(pieza))
            pieza.mover_iz();
        pieza.mover_de();

        while(mapa.pieza_valida(pieza)){
            while(mapa.pieza_valida(pieza))
                pieza.mover_ab();
            pieza.mover_ar();

            mapa.marcar_pieza(pieza);
            var new_est = calcular_movida_rec(lista.slice(1), mapa);
            if(movimientos < 0 || comparar_est(movimientos[2], new_est)){
                movimientos = [pieza.x, r, new_est];
            }
            delete new_est;
            mapa.desmarcar_pieza(pieza);
            
            pieza.y = pos_y;
            pieza.mover_de();
        }
        
        pieza.x = pos_x;
        pieza.rotar_iz();
    }
    delete pieza;
    delete pos_x;
    delete pos_y;
    delete r;
    
    return movimientos;
    delete movimientos;
}

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
    var pieza;
    var pieza_sig;
    var movida;
    if(jugador.jugando && jugador.estado == null){
        pieza = jugador.pieza.clonar();
        pieza_sig = new Pieza();
        pieza_sig.pieza_actual = jugador.pieza.pieza_sig[0];
        pieza_sig.regenerar();
        movida = calcular_movida([pieza, pieza_sig], jugador.mapa);
        
        //var movida = calcularMovida();
        
        if(jugador.pieza.rot<movida[1]){
            if(jugador.rotar_iz()){
                jugador.socket.emit('rotar_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
                jugador.dibujar();
            }
        }else
        if(jugador.pieza.x>movida[0]){
            if(jugador.mover_iz()){
                jugador.socket.emit('mover_iz', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
                jugador.dibujar();
            }
        }else
        if(jugador.pieza.x<movida[0]){
            if(jugador.mover_de()){
                jugador.socket.emit('mover_de', jugador.tiempo, jugador.pieza);
                jugador.tiempo++;
                jugador.dibujar();
            }
        }else{
            jugador.bajar();
            jugador.socket.emit('bajar', jugador.tiempo, jugador.pieza);
            jugador.tiempo++;
            jugador.dibujar();
        }
        jugador.lineas_enviar = [];
    }
    delete pieza;
    delete pieza_sig;
    delete movida;
}

setInterval('IAOrdenador()', 500);
