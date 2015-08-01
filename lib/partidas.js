/**
 * New node file
 */
var fs = require('fs');

eval(fs.readFileSync('public/js/tetris.js')+'');
eval(fs.readFileSync('public/js/itetris.js')+'');

exports.Jugador = function(partida, socket){
    this.socket = socket;
    this.nombre = socket.id;
    this.game = new Jugador(null, null);
    this.game.mapa.set_mapa_loco();
    this.partida = partida;
	var parent = this;
    
    socket.on('mover_iz', function(){
        if(parent.game.jugando)
            if(!parent.game.mover_iz())
                socket.broadcast.emit('corregir', parent.get_datos());
    });
    socket.on('mover_de', function(){
        if(parent.game.jugando)
            if(!parent.game.mover_de())
                socket.broadcast.emit('corregir', parent.get_datos());
    });
    socket.on('rotar_iz', function(){
        if(parent.game.jugando)
            if(!parent.game.rotar_iz())
                socket.broadcast.emit('corregir', parent.get_datos());
    });
    socket.on('mover_ab', function(){
        if(parent.game.jugando)
            if(!parent.game.mover_ab())
                socket.broadcast.emit('corregir', parent.get_datos());
    });
    socket.on('bajar', function(){
        if(parent.game.jugando){
            parent.game.bajar();
            parent.comprobar_lineas();
            parent.nueva_pieza();
        }
    });
    socket.on('nueva_linea', function(){
        if(parent.game.jugando){
            parent.game.nueva_linea();
            parent.comprobar_lineas();
            parent.nueva_pieza();
        }
    });
}

exports.Jugador.prototype.get_datos = function(){
	return {
		'id': this.socket.id, 
		'mapa': this.game.mapa.mapa, 
		'estado': this.game.estado, 
		'pieza': this.game.pieza
	}
}

exports.Jugador.prototype.nueva_pieza = function(){
    var pieza_sig = entreAB(0, 6);
    this.game.pieza.pieza_sig.push(pieza_sig);
    this.socket.emit('pieza_sig', pieza_sig);
    if(!this.game.mapa.pieza_valida(this.game.pieza)){
    	this.game.jugando = false;
    	this.socket.emit('perder');
    	this.partida.comprobar_ganador();
    }
}

exports.Jugador.prototype.comprobar_lineas = function(){
    if(this.game.lineas_enviar.length>0){
        for(i in this.partida.jugadores){
            if(this!=this.partida.jugadores[i]){
            	this.partida.jugadores[i].game.mapa.insertar_lineas(this.game.lineas_enviar);
            	this.partida.jugadores[i].socket.emit('recibir_lineas', this.game.lineas_enviar);
            }
        }
        this.game.lineas_enviar = [];
    }
}

exports.Jugador.prototype.bucle = function(){
    if(this.game.jugando){
        if(!this.game.mover_ab()){
            this.game.nueva_linea();
            this.comprobar_lineas();
            this.nueva_pieza();
        }
        this.socket.emit('mover_ab');
        this.socket.broadcast.emit('mapa', this.get_datos());
    }
}

exports.Partida = function(sala, newio, nio, nombre, cantidad){
	this.nombre = nombre;
	this.cantidad = cantidad;
	this.nio = nio;
	this.jugadores = {};
	this.cj = 0;
	this.estado = 0;
	this.tiempo_espera = 10;
	this.tiempo = 0;
	this.sala = sala;
    this.newio = newio;
	var parent = this;
	
	this.newio.on('connection', function(socket){
        console.log("nueva partida");
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

exports.Partida.prototype.comprobar_ganador = function(){
    var ganadores = [];
    for(i in this.jugadores){
        if(this.jugadores[i].game.jugando)
            ganadores.push(this.jugadores[i]);
    }
    if(ganadores.length==1){
    	this.estado = 0;
        ganadores[0].socket.emit('ganador');
        for(i in this.jugadores)
            this.jugadores[i].game.reset();
        if(this.cj<2){
            ganadores[0].socket.emit('estado', 0);
            ganadores[0].game.estado = 0;
        }
    }
}

exports.Partida.prototype.bucle = function(){
	if(this.estado == 0 && this.cj>=2){
		if(this.tiempo_espera>0){
			this.newio.emit('esperando', this.tiempo_espera);
			this.tiempo_espera--;
		}else
			this.comenzar_partida();
	}else{
        this.comprobar_ganador();
        oponentes = {}
        for(i in this.jugadores){
            oponentes[i] = this.jugadores[i].get_datos();
        }
        this.newio.emit('oponentes', oponentes);
        if(this.tiempo > 2){
            for(i in this.jugadores)
                this.jugadores[i].bucle();
            this.tiempo = 0;
        }
        this.tiempo += 1;
	}
}

exports.Partida.prototype.comenzar_partida = function(){
	this.estado = 1;
    this.tiempo_espera = 10;
	for(i in this.jugadores){
        this.jugadores[i].game.reset();
        this.jugadores[i].game.jugando = true;
        this.jugadores[i].game.estado = null;
		this.jugadores[i].socket.emit('iniciar', 
			{
				'id': this.jugadores[i].socket.id, 
				'mapa': this.jugadores[i].game.mapa.mapa, 
				'pieza': this.jugadores[i].game.pieza
			});
	}
}

exports.Sala = function(io){
	this.partidas = [];
	this.io = io;
	this.iosala = io.of('/sala');
	var parent = this;
	
	this.iosala.on('connection', function(socket){
        console.log("Nueva conexion a sala");
		socket.emit('listado', parent.get_listado());
	});
}

exports.Sala.prototype.crear_partida = function(nio, nombre, cantidad){
	var newio = this.io.of('/partida' + nio);
	var partida = new exports.Partida(this, newio, nio, nombre, cantidad);
	this.partidas.push(partida);
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
