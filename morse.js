"use strict";

// var socket = require('io');
var Morse = Morse || {};

/* Constants */
// 1 DAH = 3 DIT, 1 WS = 7 DIT
Morse.DIT = 60;
Morse.DAH = 180;
// Morse.LS = 420; // Letter spacing
Morse.WS = 420; // Word spacing

Morse.triggerKeys = [ "Meta" ];

/* Encoding table {{{ */
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
/* }}} */

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

// Returns bitstream, terminating with -1
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
	return bits.concat(-1); // Terminate with -1 
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
	Morse.osc.frequency.value = 660; // Hz

	Morse.osc.connect(Morse.vol);
	Morse.vol.connect(context.destination);
	Morse.signal = false;
	Morse.osc.start();

	// Init queue
	Morse.bits = new Queue();
	Morse.playFromSeq = false;

	// Init clocks
	Morse.clockOn  = Date.now(); // When the signal was turned on
	Morse.clockOff = Date.now(); // When the signal was turned off
};

// Play signal on client
Morse.signalOn = function() { Morse.signal = true; Morse.updateSignal(); Morse.clockOn = Date.now(); }
Morse.signalOff = function() { Morse.signal = false; Morse.updateSignal(); Morse.clockOff = Date.now(); }

// Send to server
Morse.sendSignalOn = function() { socket.emit('signal on'); }
Morse.sendSignalOff = function() { socket.emit('signal off'); }
Morse.sendSignal = function(bool) { bool ? Morse.sendSignalOn() : Morse.sendSignalOff(); }

Morse.updateSignal = function() { Morse.vol.gain.value = !!Morse.signal; }

// Key events
window.onkeydown = function(e) {
	if (Morse.triggerKeys.indexOf(e.key) > -1) { Morse.sendSignalOn(); }
}
window.onkeyup = function(e) {
	if (Morse.triggerKeys.indexOf(e.key) > -1) { Morse.sendSignalOff(); }
}

// Automated keyer
Morse.signalPlay = function(durs) {
	Morse.bits.pushArrays(Morse.getBitstream(durs));
	Morse.playFromSeq = true;
};

Morse.update = function() {
	if (Morse.playFromSeq) {
		var signal = Morse.bits.next();
		if (signal == -1) Morse.playFromSeq = false;
		else Morse.sendSignal(signal);
	}
};

Morse.getType = function() {
	var time = Morse.clockOff - Morse.clockOn;
	// Determine if dit or dah or space, by comparing to DAH
	if (time >= Morse.DAH) { return '-'; } // dah
	else if (0 < time && time < Morse.DAH) { return '.'; } // dit
	else if (-time > Morse.WS) { return ' / '; } // word space
	else if (-time > Morse.DAH) { return ' '; } // letter space
	else { return ''; } // nothing

	// TODO fix when app just started and getType() returns space
}

// Use setInterval instead of requestAnimationFrame so it can work in the background
Morse.animFrame = setInterval(Morse.update, 12); // 12 seems to work
