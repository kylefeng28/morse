const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Morse = require('./morse');

// Init Morse and redefine sendSignal methods to work server-side
// TODO this is so hackish
Morse.signalInit();
Morse.sendSignalOn = function() { io.emit('signal on'); }
Morse.sendSignalOff = function() { io.emit('signal off'); }

let nUsers = 0;

// Index
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/morse.html');
});

// Static
app.use('/', express.static(__dirname + '/'));

// Parse body
app.use(bodyParser.json());

// POST routes
app.post('/send', function(req, res) {
	let input = req.body['input'];
	Morse.signalPlay(input);
	res.send(input);
});
app.post('/encode', function(req, res) {
	let input = req.body['input'];
	let encoded = Morse.encode(input).join(' ')
	res.send(encoded);
});
app.post('/encode/send', function(req, res) {
	let input = req.body['input'];
	let encoded = Morse.encode(input).join(' ')
	Morse.signalPlay(encoded);
	res.send(encoded);
});
app.post('/signal/on', function(req, res) {
	io.emit('signal on');
	res.status(200).send('on');
});
app.post('/signal/off', function(req, res) {
	io.emit('signal off');
	res.status(200).send('off');
});

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
let _port = 3000;
http.listen(_port, function() { // or app.listen()?
	console.log('listenig on *:' + _port)
})
