/**
 * New node file
 */
var fs = require('fs');
var uuid = require('node-uuid');

eval(fs.readFileSync('public/js/tetris.js')+'');
eval(fs.readFileSync('public/js/itetris.js')+'');
eval(fs.readFileSync('public/js/ordenador.js')+'');


function iguales(pieza1, pieza2, altura){
    if(pieza1.x == pieza2.x &&
        Math.abs(pieza1.y - pieza2.y) <= altura &&
        pieza1.rot == pieza2.rot &&
        pieza1.pieza_actual == pieza2.pieza_actual &&
        pieza1.pieza_sig[0] == pieza2.pieza_sig[0])
        return true;
    else
        return false;
}


exports.Jugador = function(partida, socket){
    this.socket = socket;
    this.game = new Jugador(null, null);
    this.game.mapa.set_mapa_rayado();
    this.partida = partida;
    this.movimientos = {};
    
    if(this.socket!=null){
        this.id = socket.id;
        this.nombre = socket.id;
        var parent = this;
        
        socket.on('mover_iz', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'mover_iz',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
        socket.on('mover_de', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'mover_de',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
        socket.on('rotar_iz', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'rotar_iz',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
        socket.on('mover_ab', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'mover_ab',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
        socket.on('bajar', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'bajar',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
        socket.on('nueva_linea', function(t, pieza){
            if(parent.game.jugando && pieza){
                parent.movimientos[t] = {
                    'mov': 'nueva_linea',
                    'pieza': pieza
                }
                parent.aplicar_movimientos();
            }
        });
    }
}

exports.Jugador.prototype.aplicar_movimientos = function(){
    var corregir = false;
    while(String(this.game.tiempo) in this.movimientos){
        var mov = this.movimientos[this.game.tiempo]['mov'];
        var pieza = this.movimientos[this.game.tiempo]['pieza'];
        switch(mov){
            case 'mover_iz':
                if(!this.game.mover_iz() || !iguales(this.game.pieza, pieza, 1))
                    corregir = true;
                break;
            case 'mover_de':
                if(!this.game.mover_de() || !iguales(this.game.pieza, pieza, 1))
                    corregir = true;
                break;
            case 'rotar_iz':
                if(!this.game.rotar_iz() || !iguales(this.game.pieza, pieza, 1))
                    corregir = true;
                break;
            case 'mover_ab':
                if(!this.game.mover_ab() || !iguales(this.game.pieza, pieza, 0))
                    corregir = true;
                break;
            case 'bajar':
                this.game.bajar();
                this.comprobar_lineas();
                this.nueva_pieza();
                if(!iguales(this.game.pieza, pieza, 0))
                    corregir = true;
                break;
            case 'nueva_linea':
                this.game.nueva_linea();
                this.comprobar_lineas();
                this.nueva_pieza();
                if(!iguales(this.game.pieza, pieza, 0))
                    corregir = true;
                break;
        }
        delete this.movimientos[this.game.tiempo];
        delete mov;
        delete pieza;
        
        if(corregir)
            break;
        
        this.game.tiempo++;
    }
    if(!corregir)
        for(i in this.movimientos){
            if(i - this.game.tiempo > 10){
                console.log("Tiempos");
                console.log(i);
                console.log(this.game.tiempo);
                corregir = true;
                break;
            }
        }
        
    if(corregir){
        this.movimiento = {};
        this.socket.emit('corregir', this.get_datos());
    }

    delete corregir;
}

exports.Jugador.prototype.get_datos = function(){
    return {
        'id': this.id, 
        'nombre': this.nombre, 
        'mapa': this.game.mapa.mapa, 
        'estado': this.game.estado, 
        'tiempo': this.game.tiempo, 
        'pieza': this.game.pieza
    }
}

exports.Jugador.prototype.nueva_pieza = function(){
    var pieza_sig = entreAB(0, 6);
    this.game.pieza.pieza_sig.push(pieza_sig);
    if(this.socket!=null)
        this.socket.emit('pieza_sig', pieza_sig);
    if(!this.game.mapa.pieza_valida(this.game.pieza)){
        this.game.jugando = false;
        if(this.socket!=null)
            this.socket.emit('perder', this.get_datos());
        this.partida.comprobar_ganador();
    }
}

exports.Jugador.prototype.comprobar_lineas = function(){
    if(this.game.lineas_enviar.length > 0){
        for(i in this.partida.jugadores){
            if(this!=this.partida.jugadores[i] && this.partida.jugadores[i].game.jugando && this.partida.jugadores[i].game.estado==null){
                for(var l=0;l<this.game.lineas_enviar.length;l++)
                    this.partida.jugadores[i].game.lineas_recibir.push(this.game.lineas_enviar[l]);
                if(this.partida.jugadores[i].socket!=null)
                    this.partida.jugadores[i].socket.emit('recibir_lineas', this.partida.jugadores[i].game.lineas_recibir);
            }
        }
        this.game.lineas_enviar = [];
    }
}

exports.Jugador.prototype.bucle = function(){
    if(this.game.jugando){
        if(this.partida.tiempo > 20){
            if(!this.game.mover_ab()){
                this.game.nueva_linea();
                this.comprobar_lineas();
                this.nueva_pieza();
            }
            if(this.socket != null)
                this.socket.emit('mover_ab');
        }
        /*
        if(this.socket==null)
            this.movimiento_ia();
        */
    }
}

exports.Jugador.prototype.movimiento_ia = function(){
    if(this.game.jugando){
        var pieza;
        var pieza_sig;
        var movida;
        if(this.game.jugando && this.game.estado == null){
            pieza = this.game.pieza.clonar();
            pieza_sig = new Pieza();
            pieza_sig.pieza_actual = this.game.pieza.pieza_sig[0];
            pieza_sig.regenerar();
            movida = calcular_movida([pieza, pieza_sig], this.game.mapa);
            
            if(this.game.pieza.rot < movida[1]){
                this.game.rotar_iz();
            }else
            if(this.game.pieza.x > movida[0]){
                this.game.mover_iz();
            }else
            if(this.game.pieza.x < movida[0]){
                this.game.mover_de();
            }else{
                this.game.bajar();
                this.comprobar_lineas();
                this.nueva_pieza();
            }
            this.game.lineas_enviar = [];
        }
        delete pieza;
        delete pieza_sig;
        delete movida;
    }
}

exports.Partida = function(sala, newio, nio, nombre, cantidad){
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.nio = nio;
    this.jugadores = {};
    this.cj = 0;
    this.estado = 0;
    this.tiempo_espera = 3;
    this.tiempo = 0;
    this.sala = sala;
    this.newio = newio;
    var parent = this;

    this.newio.on('connection', function(socket){
        if(parent.cj < parent.cantidad){
            parent.ingresar(socket);
            socket.on('set_nombre', function(nombre){
                parent.jugadores[socket.id].nombre = nombre;
            });
            socket.on('disconnect', function(){
                if(socket.id in parent.jugadores){
                    delete parent.jugadores[socket.id];
                    parent.cj--;
                    parent.sala.enviar_listado();
                    if(parent.estado == 1){
                        parent.comprobar_ganador();
                        socket.broadcast.emit('eliminar', socket.id);
                    }
                }
            });
        }else{
            socket.emit('partida_completa');
        }
    });
}

exports.Partida.prototype.ingresar = function(socket){
    var jugador = new exports.Jugador(this, socket);
    this.jugadores[socket.id] = jugador;
    this.cj++;
    this.sala.enviar_listado();
    if(this.estado == 0){
        if(this.cj<2){
            socket.emit('estado', 0);
            jugador.game.estado = 0;
        }
    }else{
        socket.emit('estado', 1);
        jugador.game.estado = 1;
    }
}

exports.Partida.prototype.crear_jugador_ia = function(nombre){
    var jugador = new exports.Jugador(this, null);
    jugador.id = uuid.v1();
    this.jugadores[jugador.id] = jugador;
    this.cj++;
    this.sala.enviar_listado();
    return jugador;
}



exports.Partida.prototype.comprobar_ganador = function(){
    var ganadores = [];
    for(i in this.jugadores){
        if(this.jugadores[i].game.jugando)
            ganadores.push(this.jugadores[i]);
    }
    if(ganadores.length==1){
        this.estado = 0;
        if(ganadores[0].socket!=null)
            ganadores[0].socket.emit('ganador');
        for(i in this.jugadores)
            this.jugadores[i].game.reset();
        if(this.cj<2){
            if(ganadores[0].socket!=null)
                ganadores[0].socket.emit('estado', 0);
            ganadores[0].game.estado = 0;
        }
    }
}

exports.Partida.prototype.bucle = function(){
    if(this.estado == 0 && this.cj>=2){
        if(this.tiempo > 10){
            if(this.tiempo_espera > 0){
                this.newio.emit('esperando', this.tiempo_espera);
                this.tiempo_espera--;
            }else
                this.comenzar_partida();
            this.tiempo = 0;
        }
        this.tiempo += 1;
    }else{
        this.comprobar_ganador();
        oponentes = {}
        for(i in this.jugadores){
            oponentes[i] = this.jugadores[i].get_datos();
        }
        this.newio.emit('oponentes', oponentes);
        for(i in this.jugadores)
            this.jugadores[i].bucle();
        if(this.tiempo > 20)
            this.tiempo = 0;
        this.tiempo += 1;
    }
}

exports.Partida.prototype.comenzar_partida = function(){
    this.estado = 1;
    this.tiempo_espera = 3;
    for(i in this.jugadores){
        this.jugadores[i].game.reset();
        this.jugadores[i].game.pieza.regenerar();
        this.jugadores[i].game.jugando = true;
        this.jugadores[i].game.estado = null;
        this.jugadores[i].movimientos = {};
        this.jugadores[i].game.tiempo = 0;
        this.jugadores[i].game.mapa.set_mapa_rayado();
        if(this.jugadores[i].socket!=null){
            this.jugadores[i].socket.emit('iniciar', 
                {
                    'id': this.jugadores[i].id, 
                    'mapa': this.jugadores[i].game.mapa.mapa, 
                    'tiempo': this.jugadores[i].game.tiempo, 
                    'pieza': this.jugadores[i].game.pieza
                });
        }
    }
}

exports.Sala = function(io){
    this.partidas = [];
    this.io = io;
    this.iosala = io.of('/sala');
    var parent = this;

    this.iosala.on('connection', function(socket){
        socket.emit('listado', parent.get_listado());
    });
}

exports.Sala.prototype.crear_partida = function(nio, nombre, cantidad){
    var newio = this.io.of('/partida' + nio);
    var partida = new exports.Partida(this, newio, nio, nombre, cantidad);
    this.partidas.push(partida);
    return partida;
}

exports.Sala.prototype.get_listado = function(socket){
    var salida = [];
    for(i in this.partidas)
        salida.push({
            'nio': this.partidas[i].nio, 
            'nombre': this.partidas[i].nombre, 
            'cj': this.partidas[i].cj, 
            'cantidad': this.partidas[i].cantidad
        });
    return salida;
}

exports.Sala.prototype.enviar_listado = function(){
    this.iosala.emit('listado', this.get_listado());
}

exports.Sala.prototype.bucle = function(){
    for(i in this.partidas)
        this.partidas[i].bucle();
}
