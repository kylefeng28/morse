var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/morse.html');
});

// Static
app.use('/static', express.static(__dirname + '/static'));
app.use('/', express.static(__dirname + '/'));

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('signal on', function() {
        io.emit('signal on');
        console.log('signal on'); // debug
    });
    socket.on('signal off', function() {
        io.emit('signal off');
        console.log('signal off'); // debug
    });
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

var _port = 3000;
http.listen(_port, function() { // or app.listen()
	console.log('listenig on *:' + _port)
})
