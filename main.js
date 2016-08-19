// Client-side code
var input = document.querySelector('#input');
var output = document.querySelector('#output');
var encode = document.querySelector('#encode');
var decode = document.querySelector('#decode');
var play = document.querySelector('#play');

var stats = document.querySelector('#stats');
var stats_users = document.querySelector('#stats #users');

encode.onclick = function() { output.value = Morse.encode(input.value).join(' '); }
decode.onclick = function() { output.value = Morse.decode(input.value.split(' ')); }
vibrate.onclick = function() { Morse.vibrate(input.value.split('')); }
play.onclick = function() { Morse.signalPlay(input.value.split('')); }

input.value = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'; // HELLO WORLD

Morse.signalInit();
// })();

// Socket.io
var socket = io();

// Receive from server
socket.on('signal on', function() {
	Morse.signalOn();
	console.log('signal on'); // debug
});
socket.on('signal off', function() {
	Morse.signalOff();
	console.log('signal off'); // debug
});

socket.on('sync data', function(msg) {
	stats_users.innerText = msg.users; // TODO jquerify
	console.log('sync data'); // debug
	console.log(msg); // debug
});
