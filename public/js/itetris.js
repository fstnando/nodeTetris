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
    canvas.fillStyle = IMapa.colores[col];
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

function dibCuaB(canvas, px1, py1, tam, col){
    var px2 = tam - 1;
    var py2 = tam - 1;
    canvas.beginPath();
    canvas.rect(px1, py1, px2, py2);
    canvas.closePath();
    canvas.strokeStyle = '#000000';
    canvas.lineWidth = 1;
    canvas.fillStyle = IMapa.colores[col];
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

function IMapa(canvas, mapa){
    this.mapa = mapa;
    this.canvas = canvas;
    this.tam = IMapa.tam;

    this.dibujar = function(){
        this.canvas.clearRect(0, 0, Mapa.mx * this.tam, Mapa.my * this.tam);
        for(var i=0;i<Mapa.mx;i++){
            for(var j=0;j<Mapa.my;j++){
                if(this.mapa.mapa[j][i]!=-1)
                    dibCua(this.canvas, i, j, this.mapa.mapa[j][i], this.tam);
            }
        }
    }
}
IMapa.tam = 16;
IMapa.colores = ['#FF4444', '#888888', '#88FFFF', '#FFFF44', '#FF44FF', '#4444FF', '#44FF44']

function IPieza(canvas, cansig, pieza){
    this.canvas = canvas;
    this.cansig = cansig;
    this.pieza = pieza;
    this.tam = IMapa.tam;

    this.dibujar = function(){
        for(var i=0;i<4;i++){
            dibCua(this.canvas, this.pieza.x + this.pieza.p[i][0], this.pieza.y + this.pieza.p[i][1], this.pieza.pieza_actual, this.tam);
        }
    }

    this.dibsig = function(){
        var color = this.pieza.pieza_sig[0];
        var pieza = Pieza.piezas[color];
        this.cansig.clearRect(0, 0, 4 * this.tam, 4 * this.tam);
        var px = 0.0;
        var py = 0.0;
        for(var i=0;i<4;i++){
            px = px + pieza[i][0] * this.tam;
            py = py + pieza[i][1] * this.tam;
        }
        px = 30 - px / 4.0;
        py = 30 - py / 4.0;

        for(var i=0;i<4;i++)
            dibCuaB(this.cansig, px + pieza[i][0] * this.tam, py + pieza[i][1] * this.tam, this.tam, color);
    }
}
