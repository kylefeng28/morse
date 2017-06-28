"use strict";

// Client-side code
var input = document.querySelector('#input');
var output = document.querySelector('#output');
var encode = document.querySelector('#encode');
var decode = document.querySelector('#decode');
var play = document.querySelector('#play');
var clear = document.querySelector('#clear');

var stats = document.querySelector('#stats');
var stats_users = document.querySelector('#stats #users');

encode.onclick = function() { output.value = Morse.encode(input.value).join(' '); }
decode.onclick = function() { output.value = Morse.decode(input.value.split(' ')); }
vibrate.onclick = function() { decode.onclick(); Morse.vibrateFromSeq(input.value.split('')); }
play.onclick = function() { decode.onclick(); Morse.signalPlay(input.value.split('')); }
clear.onclick = function() { input.value = ""; }

input.value = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'; // HELLO WORLD

Morse.signalInit();
// })();

// Socket.io
var socket = io();

// Receive from server
socket.on('signal on', function() {
	// Only if signal is not on
	if (!Morse.signal) {
		Morse.signalOn();
		console.log('signal on'); // debug
		input.value += Morse.getType(); // Add space, tmp
		decode.onclick(); // tmp
	}
});
socket.on('signal off', function() {
	// Only if signal is on
	if (Morse.signal) {
		Morse.signalOff();
		console.log('signal off'); // debug
		input.value += Morse.getType(); // Add dit or dah, tmp
		decode.onclick(); // tmp
	}
});

socket.on('sync data', function(msg) {
	stats_users.innerText = msg.users; // TODO jquerify
	console.log('sync data'); // debug
	console.log(msg); // debug
});

// Key events
window.onkeydown = function(e) {
	if (Morse.triggerKeys.indexOf(e.key) > -1) { Morse.sendSignalOn(); }
	if (e.key == "Alt") { input.value = ""; output.value = ""; } // Clear input fields (move to main.js?)
}
window.onkeyup = function(e) {
	if (Morse.triggerKeys.indexOf(e.key) > -1) { Morse.sendSignalOff(); }
}
