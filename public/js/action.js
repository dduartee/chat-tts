var socket = io();
var ms = 0;

socket.on('contador', function (data) {
    document.getElementById('contador').innerHTML = data;
});

$(function () { // chat
    var msg_audio = $("#msg_audio");
    var user = $("#user");
    var enviar_audio = $("#enviar_audio");
    var trocar_user = $("#trocar_user");
    var chat = $("#chat");
    var status = $("#status");
    var audio = new Audio('juntos.mp3');
    
    socket.on('pong', function (ms) {
        //document.getElementById('latencia').innerHTML = ms;
        status.html(' '); // 1seg
    });
    $("#msg_audio").keypress(function(event) { 
        if (event.keyCode === 13) { 
            $("#enviar_audio").click();
        } 
    });
    enviar_audio.click(function () {
        socket.emit('enviar_audio', { audio: msg_audio.val() });
        msg_audio.val('');
        status.html(' ');
    });
    socket.on("enviar_audio", function (data) { // retorno de mensagem
        chat.append(`<p>${data.user}: <audio controls="" preload="none" src="${data.audio}"></audio></p><br>`);
        var elem = document.getElementById('chatroom');
        elem.scrollTop = elem.scrollHeight;
        audio.play();
    });

    trocar_user.click(function () {  // trocar de user
        socket.emit('trocar_user', { user: user.val() });
    });
    msg_audio.bind("keypress", function () { // escrevendo para o socket
        socket.emit('escrevendo', { audio: msg_audio.val() });
    });
    socket.on('escrevendo', function (data) { //retorna escrevendo para os outros sockets
        status.html("<p class='status'>" + data.user + " esta escrevendo..." + "</p>")
    });
    socket.on('trocou_user', function (data) { //trocou de user
        chat.append("<p class='mensagem'>" + data.userV + " trocou de nome para " + data.userN);
        var elem = document.getElementById('chatroom');
        elem.scrollTop = elem.scrollHeight;
    })
})
