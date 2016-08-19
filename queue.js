"use strict";

/* Infinite FIFO queue
 * Similar to `Stream', but the values are not predetermined.
 * Can be used as an infinite bit stream
 * `next()' triggers a tick, and will initially only returns zero.
 * `push(val, [n])' pushes `val' to the queue, and will return after `n' ticks after the previous tick
 */
var Queue = function(defaultVal) {
	this.defaultVal = defaultVal || 0;
	this.vals = [];
	this.ticks = [];
};

Queue.prototype.next = function() {
	if (this.vals.length == 0) { return this.defaultVal; }
	var a = --this.ticks[this.ticks.length-1]; // Ticks left to return the next value
	// Pop and return value if zero
	if (a == 0) {
		this.ticks.pop();
		return this.vals.pop();
	} else return this.defaultVal;
};

Queue.prototype.push = function(val, n) {
	n = n || 1;
	this.vals.push(val);
	this.ticks.push(n);
};

Queue.prototype.pushArrays = function(vals, ns) {
	ns = ns || Array(vals.length).fill(1);
	this.vals = this.vals.concat(vals.reverse()); // reverse because it's FIFO
	this.ticks = this.ticks.concat(ns.reverse());
};

/* TODO: safety check
 * n is an (+) integer
 * repeat ns if not same length
 */
