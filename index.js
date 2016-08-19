var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var nUsers = 0;

// Index
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/morse.html');
});

// Static
app.use('/', express.static(__dirname + '/'));

// Socket.io
io.on('connection', function(socket) {
	nUsers++;
	io.emit('sync data', { users: nUsers });
    console.log('a user connected');
	console.log('number of users online: ' + nUsers);

    socket.on('signal on', function() {
        io.emit('signal on'); // reflect
        console.log('signal on'); // debug
    });
    socket.on('signal off', function() {
        io.emit('signal off'); // reflect
        console.log('signal off'); // debug
    });
    socket.on('disconnect', function() {
		nUsers--;
		io.emit('sync data', { users: nUsers });
        console.log('user disconnected');
		console.log('number of users online: ' + nUsers);
    });
});

// Listen
var _port = 3000;
http.listen(_port, function() { // or app.listen()?
	console.log('listenig on *:' + _port)
})
