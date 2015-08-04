function entreAB(a, b){
    return a + Math.floor(Math.random() * (b - a + 1));
}

function Mapa(){
    this.mapa = []
    for(var j=0;j<Mapa.my;j++){
        this.mapa.push([]);
        for(var i=0;i<Mapa.mx;i++)
            this.mapa[j].push(-1);
    }
    this.reset_mapa = function(){
        for(var j=0;j<Mapa.my;j++)
            for(var i=0;i<Mapa.mx;i++)
                    this.mapa[j][i] = -1;
    }
    this.set_mapa_loco = function(){
        for(var j=0;j<Mapa.my;j++){
            for(var i=0;i<Mapa.mx;i++){
                if(i!=5 && j>22)
                    this.mapa[j][i] = 0;
                else
                    this.mapa[j][i] = -1;
            }
        }
    }
    this.pieza_valida = function(pieza){
        var salida = true;
        if(pieza.x + pieza.p[4][0] >=0 &&
           pieza.y + pieza.p[4][1] >=0 &&
           pieza.x + pieza.p[5][0] < Mapa.mx &&
           pieza.y + pieza.p[5][1] < Mapa.my)
            for(var i=0;i<4;i++){
                var px = pieza.x + pieza.p[i][0];
                var py = pieza.y + pieza.p[i][1];
                if(this.mapa[py][px] != -1){
                    salida = false;
                    break;
                }
            }
        else
            salida = false;
        return salida;
    }
    this.marcar_pieza = function(pieza){
        for(var i=0;i<4;i++){
            var px = pieza.x + pieza.p[i][0];
            var py = pieza.y + pieza.p[i][1];
            this.mapa[py][px] = pieza.pieza_actual;
        }
    }
    this.desmarcar_pieza = function(pieza){
        for(var i=0;i<4;i++){
            var px = pieza.x + pieza.p[i][0];
            var py = pieza.y + pieza.p[i][1];
            this.mapa[py][px] = -1;
        }
    }
    this.es_linea_completa = function(y){
        var salida = true;
        for(var i=0;i<Mapa.mx;i++)
            if(this.mapa[y][i] == -1){
                salida = false;
                break;
            }
        return salida;
    }
    this.mover_linea = function(y1, y2){
        for(var i=0;i<Mapa.mx;i++)
            this.mapa[y2][i] = this.mapa[y1][i];
    }
    this.insertar_lineas = function(lineas){
        for(var i=lineas.length;i<Mapa.my;i++)
            this.mapa[i - lineas.length] = this.mapa[i].slice(0);
        for(var j=0;j<lineas.length;j++)
            this.mapa[Mapa.my - lineas.length + j] = lineas[j].slice(0);
    }
    this.estadistica = function(){
        var altura = [];
        var espacios = 0;
        var lineas = 0;
        var menor = Mapa.my;
        var mayor = 0;
        for(var i=0;i<Mapa.mx;i++){
            var j =  0;
            while(j<Mapa.my && this.mapa[j][i]==-1)
                j++;
            altura.push(j);
            if(j<menor)
                menor = j;
            if(j>mayor)
                mayor = j;
            j++;
            while(j<Mapa.my){
                if(this.mapa[j][i]==-1)
                    espacios++;
                j++;
            }
        }
        diff = 0;
        for(var i=0;i<Mapa.mx - 1;i++)
            diff += Math.abs(altura[i] - altura[i + 1]);
        
        prom = 0;
        for(var i=0;i<Mapa.mx;i++)
            prom += Math.pow(Mapa.mx - altura[i], 2);
        prom = prom / Mapa.mx;
        
        for(var j=0;j<Mapa.my;j++)
            if(this.es_linea_completa(j))
                lineas++;
        if(lineas==1)
            lineas = 0;
        if(mayor - menor < 10)
            return [lineas, espacios, diff]
        else
            return [lineas, diff, espacios]
    }
}
Mapa.mx = 10
Mapa.my = 25

function Pieza(){
    this.x = 5;
    this.y = 3;
    this.rot = 0;
    this.pieza_actual = entreAB(0, 6);
    this.p = [];
    this.pieza_sig = [];
    for(var i=0;i<10;i++)
        this.pieza_sig.push(entreAB(0, 6));

    for(var i=0;i<6;i++){
        this.p[i] = [];
        for(var j=0;j<2;j++){
            this.p[i][j] = Pieza.piezas[this.pieza_actual][i][j];
        }
    }
    this.regenerar = function(){
        for(var i=0;i<6;i++)
            for(var j=0;j<2;j++){
                this.p[i][j] = Pieza.piezas[this.pieza_actual][i][j];
            }
    }
    this.mover_iz = function(){
        this.x = this.x - 1;
    }
    this.mover_de = function(){
        this.x = this.x + 1;
    }
    this.mover_ar = function(){
        this.y = this.y - 1;
    }
    this.mover_ab = function(){
        this.y = this.y + 1;
    }
    this.rotar_iz = function(){
        for(var i=0;i<6;i++){
            var aux = this.p[i][0];
            this.p[i][0] = -this.p[i][1];
            this.p[i][1] = aux;
        }
        this._rec_max_min();
        this.rot = (this.rot + 1) % 4;
    }
    this.rotar_de = function(){
        for(var i=0;i<6;i++){
            var aux = this.p[i][0];
            this.p[i][0] = this.p[i][1];
            this.p[i][1] = -aux;
        }
        this._rec_max_min();
        this.rot = (this.rot - 1) % 4;
    }
    this._rec_max_min = function(){
        var aux;
        for(var i=0;i<2;i++)
            if(this.p[4][i] > this.p[5][i]){
                aux = this.p[5][i];
                this.p[5][i] = this.p[4][i];
                this.p[4][i] = aux;
            }
    }
    this.reset = function(){
        this.x = 5;
        this.y = 3;
        this.rot = 0;
        this.pieza_actual = entreAB(0, 6);
        this.pieza_sig = [];
        for(var i=0;i<10;i++)
            this.pieza_sig.push(entreAB(0, 6));
    }
    this.nueva_pieza = function(){
        this.x = 5;
        this.y = 3;
        this.rot = 0;
        this.pieza_actual = this.pieza_sig.shift();
        //this.pieza_sig.push(entreAB(0, 6));
        this.regenerar();
    }
    this.clonar = function(){
        var nueva = new Pieza();
        nueva.x = this.x;
        nueva.y = this.y;
        nueva.rot = this.rot;
        nueva.pieza_actual = this.pieza_actual;
        nueva.pieza_sig = [];
        for(var i=0;i<10;i++)
            nueva.pieza_sig.push(this.pieza_sig[i]);
        nueva.regenerar();
        return nueva;
    }
}
Pieza.piezas = [
    // Largo
    [[0,-1],[0,0],[0,1],[0,2],[0,-1],[0,2]],
    // Tres patas
    [[-1,0],[0,0],[0,1],[1,0],[-1,0],[1,1]],
    // Cuadrado
    [[0,0],[0,1],[1,0],[1,1],[0,0],[1,1]],
    // L
    [[-1,0],[0,0],[0,1],[0,2],[-1,0],[0,2]],
    // L inv
    [[1,0],[0,0],[0,1],[0,2],[0,0],[1,2]],
    // 2 inv
    [[-1,1],[0,1],[0,0],[1,0],[-1,0],[1,1]],
    // 2
    [[1,1],[0,1],[0,0],[-1,0],[-1,0],[1,1]],
]

function Jugador(pantalla, canvas){
    this.canvas = canvas;
    this.pantalla = pantalla;
    this.mapa = new Mapa();
    this.pieza = new Pieza();
    this.ipantalla = new IPantalla(this);
    this.lineas = 0;
    this.consecutivas = 0;
    this.puntos = 0;
    this.lineas_enviar = [];
    this.jugando = false;
    this.socket = null;
    this.oponentes = {};
    this.mensaje = "";
    this.estado = null;
    
    this.reset = function(){
        this.jugando = false;
        this.lineas_enviar = [];
        this.lineas = 0;
        this.consecutivas = 0;
        this.puntos = 0;
        this.mapa.reset_mapa();
        this.pieza.reset();
    }

    this.comprobar_lineas = function(){
        var lineas = [];
        var mover = [];
        for(var j=this.pieza.y+this.pieza.p[5][1];j>=this.pieza.y+this.pieza.p[4][1];j--){
            if(this.mapa.es_linea_completa(j)){
                lineas.push(j);
            }else
                if(lineas.length > 0)
                    mover.push(j);
        }
        if(lineas.length > 1){
            this.mapa.desmarcar_pieza(this.pieza);
            for(var i=0;i<lineas.length;i++)
                this.lineas_enviar.unshift(this.mapa.mapa[lineas[i]].slice(0));
            this.mapa.marcar_pieza(this.pieza);
        }
        if(lineas.length > 0){
            this.consecutivas++;
            this.puntos = this.puntos + 10 * lineas.length + 20 * (lineas.length - 1);
            var ultima = lineas[0];
            var altura;
            while(mover.length > 0){
                altura = mover.shift();
                this.mapa.mover_linea(altura, ultima);
                ultima--;
            }
            altura = this.pieza.y + this.pieza.p[4][1] - 1;
            while(altura>0){
                this.mapa.mover_linea(altura, ultima);
                altura--;
                ultima--;
            }
            if(this.consecutivas > 1){
                this.puntos = this.puntos + 20 * this.consecutivas;
            }
            this.lineas += lineas.length;
        } else {
            this.consecutivas = 0;
        }
    }

    this.nueva_linea = function(){
        this.mapa.marcar_pieza(this.pieza);
        this.comprobar_lineas();
        this.pieza.nueva_pieza();
    }

    this.mover_ab = function(){
        var mover = false;
        this.pieza.mover_ab();
        if(!this.mapa.pieza_valida(this.pieza))
            this.pieza.mover_ar();
        else
            mover = true;
        return mover;
    }

    this.mover_iz = function(){
        var mover = false;
        this.pieza.mover_iz();
        if(!this.mapa.pieza_valida(this.pieza))
            this.pieza.mover_de();
        else
            mover = true;
        return mover;
    }

    this.mover_de = function(){
        var mover = false;
        this.pieza.mover_de();
        if(!this.mapa.pieza_valida(this.pieza))
            this.pieza.mover_iz();
        else
            mover = true;
        return mover;
    }

    this.rotar_iz = function(){
        var mover = false;
        this.pieza.rotar_iz();
        if(!this.mapa.pieza_valida(this.pieza))
            this.pieza.rotar_de();
        else
            mover = true;
        return mover;
    }

    this.bajar = function(){
        while(this.mapa.pieza_valida(this.pieza))
            this.pieza.mover_ab();
        this.pieza.mover_ar();
        this.nueva_linea();
    }

    this.teclas = function(codigo){
        if(this.jugando){
            switch(codigo){
                case 37:
                    if(this.mover_iz())
                        this.socket.emit('mover_iz');
                    break;
                case 38:
                    if(this.rotar_iz())
                    	this.socket.emit('rotar_iz');
                    break;
                case 39:
                    if(this.mover_de())
                    	this.socket.emit('mover_de');
                    break;
                case 40:
                    if(this.mover_ab())
                    	this.socket.emit('mover_ab');
                    else{
                        this.nueva_linea();
                        this.socket.emit('nueva_linea');
                    }
                    break;
                case 32:
                    this.bajar();
                    this.socket.emit('bajar');
                    break;
            }
            this.dibujar();
        }
    }

    this.dibujar = function(){
        this.ipantalla.dibujar();
    }
}
Jugador.T_AR = 38;
Jugador.T_AB = 40;
Jugador.T_IZ = 37;
Jugador.T_DE = 40;
Jugador.T_BAJAR = 32;
Jugador.estado = {
    0: 'Esperando más jugadores',
    1: 'Esperando nueva partida',
    2: '¡¡¡Ganaste!!!',
    3: 'Perdiste'
}
