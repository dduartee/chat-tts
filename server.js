const fs = require('fs')
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  pingInterval: 1000
});
var googleTTS = require('./tts/index');
var downloadFile = require('./tts/download');
var contador = 0;
var cores = [];

app.get('/', function (req, res) { //inicialização da pagina
  res.sendFile(__dirname + '/public/index.html');
  app.use(express.static(path.join(__dirname, 'public')));
});

io.on('connection', function (socket) {
  contador++; //aumenta contador de usuarios
  console.log('[+] ' + socket.id + ' entrou');
  io.emit('contador', contador);
  io.emit('cor', cores[contador])

  //chat
  function tratarString(str, len) {
    if (str == '') {
      return 0;
    }
    else {
      return 1;
    }
  }
  socket.username = "Anonimo";
  socket.on('trocar_user', function (data) {
    if (!tratarString(data.user, 200)) {
      return 0;
    }
    else {
      console.log(socket.username, " => nome =>", data.user)
      if (socket.username == data.user) {
        return 0;
      }
      io.sockets.emit('trocou_user', { userV: socket.username, userN: data.user });
      socket.username = data.user;
    }
  });
  socket.on('escrevendo', function (data) {
    socket.broadcast.emit('escrevendo', { user: socket.username });
    console.log(socket.username, '=> escrevendo =>', data);
  });
  socket.on('enviar_audio', function (data) {
    //console.log(data.audio);
    if (!data.audio.length) {
      return 0;
    }
    console.log(socket.username, '=> mensagem =>', data.audio);
    googleTTS(`${data.audio}`, `es-ES`, 1)   // speed normal = 1 (default), slow = 0.24
      .then(function (url) {
        console.log(url); // https://translate.google.com/translate_tts?...
        var folder = 'public/';
        var milliseconds = new Date().getTime();
        var destpath = `audios/${milliseconds}.mp3`;
        var dest = path.resolve(__dirname, folder ,destpath);
        console.log("download solicitado");
        downloadFile(url, dest)
        .then(function () {
          console.log("download concluido");
          while(!fs.existsSync(folder, destpath)) { //caso provavel impossivel
            console.log('esperando...');
            continue;
          }
          io.sockets.emit('enviar_audio', { audio: destpath, user: socket.username })
        })
      })
      .catch(function (err) {
        console.error(err.stack);
      });
  });
socket.on('disconnect', function () {
  contador--; //diminui contador de usuarios
  console.log('[-] ' + socket.id + ' saiu');
  io.emit('contador', contador);
});

});
http.listen(3001, function () { //inicia servidor na porta 3001
  console.log('Rodando em localhost:3001');
});
