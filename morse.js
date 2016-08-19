"use strict";

// var socket = require('io');
var Morse = Morse || {};

/* Constants */
// 1 DAH = 3 DIT
Morse.DIT = 60;
Morse.DAH = 180;

/* Encoding table {{{
Morse.encTab = {
	'A': '.-',
	'B': '-...',
	'C': '-.-.',
	'D': '-..',
	'E': '.',
	'F': '..-.',
	'G': '--.',
	'H': '....',
	'I': '..',
	'J': '.---',
	'K': '-.-',
	'L': '.-..',
	'M': '--',
	'N': '-.',
	'O': '---',
	'P': '.--.',
	'Q': '--.-',
	'R': '.-.',
	'S': '...',
	'T': '-',
	'U': '..-',
	'V': '...-',
	'W': '.--',
	'X': '-..-',
	'Y': '-.--',
	'Z': '--..',
	'0': '-----',
	'1': '.----',
	'2': '..---',
	'3': '...--',
	'4': '....-',
	'5': '.....',
	'6': '-....',
	'7': '--...',
	'8': '---..',
	'9': '----.',
	',': '--..--',
	'.': '.-.-.-',
	'?': '..--..',
	';': '-.-.-.',
	':': '---...',
	"'": '.----.',
	'-': '-....-',
	'/': '-..-.',
	'(': '-.--.-',
	')': '-.--.-',
	'_': '..--.-',
	' ': '/',

	// prosigns
	'SOS': '...---...',
};
}}} */

// Flip dictionary
Morse.decTab = {};
(function() {
for (var key in Morse.encTab) {
	if (Morse.encTab.hasOwnProperty(key))
		Morse.decTab[Morse.encTab[key]] = key;
}
})();

Morse.encode = function(str) {
	var m = [];
	Array.prototype.map.call(str.toUpperCase(), function(x) { m.push(Morse.encTab[x]); });
	return m;
};

Morse.decode = function(arr) {
	var m = [];
	Array.prototype.map.call(arr, function(x) { m.push(Morse.decTab[x]); });
	return m.join('');
};

// Returns array of [onDuration, offDuration]
Morse.getDurations = function(arr) {
	var durs = [];
	Array.prototype.map.call(arr, function(x) { // call() is needed bc `arr` may not be a true Array
		if (x == '.') durs.push(Morse.DIT, Morse.DIT); else
		if (x == '-') durs.push(Morse.DAH, Morse.DIT); else
		              durs.push(0, Morse.DAH);
	});
	return durs;
};

// Returns bitstream
// TODO don't depend on getDurations
Morse.getBitstream = function(arr) {
	var durs = Morse.getDurations(arr);
	var bits = [];
	durs.map(function(x, i) {
		var on = (i+1) % 2; // odd elements are onDurs, even elements are offDurs (natural counting)
		for (var j = 0; j < (x / 10); j++) { // multiply by a factor to make faster
			bits.push(on);
		}
	});
	return bits;
};

Morse.vibrate = function(arr) {
	var durs = Morse.getDurations(arr);
	window.navigator.vibrate(durs);
};

/* Signal */
// From http://stackoverflow.com/a/16573282
Morse.signalInit = function() {
	// Init sine oscillator
	var context = new (window.AudioContext || window.webkitAudioContext)();
	Morse.vol = context.createGain();

	Morse.vol.gain.value = 0; // start muted
	Morse.osc = context.createOscillator();
	Morse.osc.type = 'sine';
	Morse.osc.frequency.value = 440; // Hz

	Morse.osc.connect(Morse.vol);
	Morse.vol.connect(context.destination);
	Morse.signal = false;
	Morse.osc.start();

	// Init queue
	Morse.bits = new Queue();
};

// tmp
Morse.signalOn = function() { Morse.signal = true; }
Morse.signalOff = function() { Morse.signal = false; }

// Send to server
Morse.sendSignalOn = function() { socket.emit('signal on'); }
Morse.sendSignalOff = function() { socket.emit('signal off'); }

window.onkeydown = Morse.sendSignalOn;
window.onkeyup = Morse.sendSignalOff;

Morse.signalPlay = function(durs) {
	Morse.bits.pushArrays(Morse.getBitstream(durs))
};

Morse.update = function() {
	requestAnimationFrame(Morse.update);

	var userInput = true; // tmp
	if (!userInput) {
		Morse.signal = Morse.bits.next();
		console.log(Morse.signal); // debug
	}

	Morse.vol.gain.value = !!Morse.signal; // set signal
};


Morse.animFrame = requestAnimationFrame(Morse.update);
