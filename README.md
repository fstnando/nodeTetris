# nodeTetris

Juego online multi-jugador de Tetris.

  [![Build Status](https://travis-ci.org/fstnando/nodeTetris.svg)](https://travis-ci.org/fstnando/nodeTetris)
  [![Dependencies Status](https://david-dm.org/fstnando/nodeTetris.svg)](https://david-dm.org/fstnando/nodeTetris)

## Juego

El juego se basa en el típico Tetris. Cada partida tiene participantes y cuando uno de ellos realiza más de una linea estas son pasadas a los demás participantes. El ultimo participante en no perder es el ganador.

## Dependencias

* Node.js
* Express.js
* Socket.io

## Instalación

```
npm install
```

## Configuración

Para realizar la configuración utilizar el archivo *config.js*. Por ejemplo para correr en servidor local poner:

```
config.client_port = 8080
```

## Ejecutar

```
node app.js
```
Desde el navegador poner la siguiente url: [localhost:8080](http://localhost:8080)

## Demo

http://tetris-fstnando.rhcloud.com/

http://fstnando.no-ip.org/tetris/

## A desarrollar

* Distintas formas de juego. (Por puntaje, Survival, etc...)

## BUG en socket.io

* Para corregir el bug del puerto en los namespace de socket.io ver: https://github.com/masakij/socket.io-client/commit/5abd97b2313aa3e9c9b2e1035dd4c24379fd77e8
