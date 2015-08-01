function dibCua(canvas, x, y, col, tam){
    var px1 = x * tam;
    var py1 = y * tam;
    var px2 = tam - 1;
    var py2 = tam - 1;
    canvas.beginPath();
    canvas.rect(px1, py1, px2, py2);
    canvas.closePath();
    canvas.strokeStyle = '#000000';
    canvas.lineWidth = 1;
    canvas.fillStyle = IPantalla.colores[col];
    canvas.fill();
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo(px1 + 1, py1 + py2 - 1);
    canvas.lineTo(px1 + 1, py1 + 1);
    canvas.lineTo(px1 + px2 - 1, py1 + 1);
    canvas.lineWidth = 1;
    canvas.strokeStyle = '#FFFFFF';
    canvas.stroke();
}

function dibCuaB(canvas, px1, py1, col, tam){
    var px2 = tam - 1;
    var py2 = tam - 1;
    canvas.beginPath();
    canvas.rect(px1, py1, px2, py2);
    canvas.closePath();
    canvas.strokeStyle = '#000000';
    canvas.lineWidth = 1;
    canvas.fillStyle = IPantalla.colores[col];
    canvas.fill();
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo(px1 + 1, py1 + py2 - 1);
    canvas.lineTo(px1 + 1, py1 + 1);
    canvas.lineTo(px1 + px2 - 1, py1 + 1);
    canvas.lineWidth = 1;
    canvas.strokeStyle = '#FFFFFF';
    canvas.stroke();
}

function IPantalla(parent){
    this.parent = parent;
    this.pan_x = 0;
    this.pan_y = 0;
    this.psx = 0;
    this.psy = 0;
    this.ox = 0;
    this.oy = 0;
    this.pux = 0;
    this.puy = 0;
    
    this.dibujar = function(){
        this.dibujar_mapa();
        this.dibujar_pieza();
        this.dibsig();
        this.dibujar_oponentes();
        this.dibujar_puntos();
        this.dibujar_mensaje();
    }
    
    this.dibujar_puntos = function(){
        this.parent.canvas.fillStyle = 'blue';
        this.parent.canvas.font = (IPantalla.tam * 1.2) + "px Arial";
        this.parent.canvas.clearRect(this.pux, this.puy, this.pux + IPantalla.tam * 10, this.puy + IPantalla.tam * 4);
        this.parent.canvas.fillText("Puntos: " + this.parent.puntos, this.pux, this.puy);
        this.parent.canvas.fillText("Lineas: " + this.parent.lineas, this.pux, this.puy + IPantalla.tam * 1.4);
    }
    
    this.dibujar_mensaje = function(){
        if(this.parent.mensaje){
            this.parent.canvas.fillStyle = 'green';
            this.parent.canvas.font = (IPantalla.tam * 2) + "px Arial";
            var lx = this.parent.canvas.measureText(this.parent.mensaje).width / 2;
            this.parent.canvas.fillText(this.parent.mensaje, IPantalla.tam * ((Mapa.mx + 2) / 2) - lx, IPantalla.tam * (Mapa.my / 2));
        }
        if(this.parent.estado!=null){
            this.parent.canvas.fillStyle = 'green';
            var texto = Jugador.estado[this.parent.estado];
            this.parent.canvas.font = (IPantalla.tam / 2 ) + "px Arial";
            var lx = this.parent.canvas.measureText(texto).width / 2;
            this.parent.canvas.fillText(texto, IPantalla.tam * ((Mapa.mx + 2) / 2) - lx, IPantalla.tam * (Mapa.my / 2 + 2));
        }
    }
    
    this.dibujar_border = function(){
        for(var i=0;i<=Mapa.mx + 1;i++){
            dibCua(this.parent.canvas, i, 0, 1, IPantalla.tam);
            dibCua(this.parent.canvas, i, Mapa.my + 1, 1, IPantalla.tam);
        }
        for(var j=0;j<=Mapa.my;j++){
            dibCua(this.parent.canvas, 0, j, 1, IPantalla.tam);
            dibCua(this.parent.canvas, Mapa.mx + 1, j, 1, IPantalla.tam);
        }
        
    }
    
    this.dibujar_border_sig = function(){
        for(var i=0;i<=5;i++){
            dibCua(this.parent.canvas, i + Mapa.mx + 1, 0, 1, IPantalla.tam);
            dibCua(this.parent.canvas, i + Mapa.mx + 1, 5, 1, IPantalla.tam);
        }
        for(var j=1;j<=4;j++){
            dibCua(this.parent.canvas, 0 + Mapa.mx + 1, j, 1, IPantalla.tam);
            dibCua(this.parent.canvas, 5 + Mapa.mx + 1, j, 1, IPantalla.tam);
        }
        
    }
    
    this.dibujar_mapa = function(){
        this.parent.canvas.clearRect(IPantalla.tam, IPantalla.tam, IPantalla.tam * Mapa.mx, IPantalla.tam * Mapa.my);
        for(var i=0;i<Mapa.mx;i++)
            for(var j=0;j<Mapa.my;j++)
                if(this.parent.mapa.mapa[j][i]!=-1)
                    dibCua(this.parent.canvas, i + 1, j + 1, this.parent.mapa.mapa[j][i], IPantalla.tam);
    }
    
    this.dibujar_oponentes = function(){
        this.parent.canvas.clearRect(this.ox - 1, this.oy - 1, this.pan_x, this.pan_y);
        var pos = 0;
        for(el in this.parent.oponentes){
            var op = this.parent.oponentes[el];
            if(op.estado==null){
                var ax = (pos % 3) * (Mapa.mx + 1) * IPantalla.tam_op;
                var ay = Math.floor(pos / 3) * (Mapa.my + 1) * IPantalla.tam_op;
                for(var i=0;i<=Mapa.mx + 1;i++){
                    dibCuaB(this.parent.canvas, this.ox + ax + i * IPantalla.tam_op, this.oy + ay, 1, IPantalla.tam_op);
                    dibCuaB(this.parent.canvas, this.ox + ax + i * IPantalla.tam_op, this.oy + ay + (Mapa.my + 1) * IPantalla.tam_op, 1, IPantalla.tam_op);
                }
                for(var j=1;j<=Mapa.my;j++){
                    dibCuaB(this.parent.canvas, this.ox + ax, this.oy + ay + j * IPantalla.tam_op, 1, IPantalla.tam_op);
                    dibCuaB(this.parent.canvas, this.ox + ax + (Mapa.mx + 1) * IPantalla.tam_op, this.oy + ay + j * IPantalla.tam_op, 1, IPantalla.tam_op);
                }
                for(var i=0;i<Mapa.mx;i++)
                    for(var j=0;j<Mapa.my;j++)
                        if(op.mapa[j][i]!=-1)
                            dibCuaB(this.parent.canvas, this.ox + ax + (i + 1) * IPantalla.tam_op, this.oy + ay + (j + 1) * IPantalla.tam_op, op.mapa[j][i], IPantalla.tam_op);
                pos++;
            }
        }
    }
    
    this.dibujar_pieza = function(){
        for(var i=0;i<4;i++){
            dibCua(this.parent.canvas, this.parent.pieza.x + this.parent.pieza.p[i][0] + 1, this.parent.pieza.y + this.parent.pieza.p[i][1] + 1, this.parent.pieza.pieza_actual, IPantalla.tam);
        }
    }
    
    this.dibsig = function(){
        var color = this.parent.pieza.pieza_sig[0];
        var pieza = Pieza.piezas[color];
        this.parent.canvas.clearRect((Mapa.mx + 2) * IPantalla.tam, IPantalla.tam, 4 * IPantalla.tam, 4 * IPantalla.tam);
        var px = 0.0;
        var py = 0.0;
        for(var i=0;i<4;i++){
            px = px + pieza[i][0] * IPantalla.tam;
            py = py + pieza[i][1] * IPantalla.tam;
        }
        px =  - px / 4.0 + this.psx;
        py =  - py / 4.0 + this.psy;

        for(var i=0;i<4;i++)
            dibCuaB(this.parent.canvas, px + pieza[i][0] * IPantalla.tam, py + pieza[i][1] * IPantalla.tam, color, IPantalla.tam);
    }
    
    this.configurar = function(){
        this.pan_x = $(window).width();
        this.pan_y = $(window).height() - 10;
        this.parent.pantalla.width = this.pan_x;
        this.parent.pantalla.height = this.pan_y;
        this.parent.canvas = this.parent.pantalla.getContext("2d");
        this.parent.canvas.clearRect(0, 0, this.pan_x, this.pan_y);
        this.parent.canvas.textBaseline = "top";
        
        //  Calculos
        var tx = Mapa.mx + Mapa.mx + 3
        var ty = Mapa.my + 2
        if(this.pan_x/tx>this.pan_y/ty){
            IPantalla.tam = this.pan_y/ty;
        }else{
            IPantalla.tam = this.pan_x/tx;
        }
        IPantalla.tam_op = IPantalla.tam / 3;
        this.ox = (Mapa.mx + 3) * IPantalla.tam;
        this.oy = (7) * IPantalla.tam;
        
        this.pux = (Mapa.mx + 8) * IPantalla.tam;
        this.puy = 1 * IPantalla.tam;
        
        this.psx = (3 / 2 + Mapa.mx + 2) * IPantalla.tam;
        this.psy = (5 / 2) * IPantalla.tam;
        
        this.dibujar_border();
        this.dibujar_border_sig();
        this.dibujar();
    }
}
IPantalla.tam = 20;
IPantalla.tam_op = IPantalla.tam / 3;
IPantalla.colores = ['#FF4444', '#888888', '#88FFFF', '#FFFF44', '#FF44FF', '#4444FF', '#44FF44']
