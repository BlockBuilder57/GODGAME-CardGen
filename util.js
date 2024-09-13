function IsNullOrWhitespace( input ) {
	return !input || !input.trim();
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

/*
    cyrb53a (c) 2023 bryc (github.com/bryc)
    License: Public domain. Attribution appreciated.
    The original cyrb53 has a slight mixing bias in the low bits of h1.
    This shouldn't be a huge problem, but I want to try to improve it.
    This new version should have improved avalanche behavior, but
    it is not quite final, I may still find improvements.
    So don't expect it to always produce the same output.
*/
const cyrb53a = function(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for(let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 0x85ebca77);
		h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d);
	}
	h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
	h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
	h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;
	return 2097152 * (h2 >>> 0) + (h1 >>> 11);
};

function ClearTextFormattingOnBlur(e) {
	e.srcElement.innerText = e.srcElement.textContent;
}

function ClearTextFormattingOnPaste(e) {
	e.preventDefault();
	var text = e.clipboardData.getData("text/plain");
	document.execCommand("insertHTML", false, text);
}

// Extensions

DOMRectReadOnly.prototype.relativeCenter = function(floor = false) {
	if (floor)
		return [Math.floor(this.width/2.0), Math.floor(this.height/2.0)];
	return [this.width/2.0, this.height/2.0];
}
DOMRectReadOnly.prototype.scale = function(scale = 1.0) {
	this.x *= scale;
	this.y *= scale;
	this.width *= scale;
	this.height *= scale;
	return this;
}

// Vector-like operations
Array.prototype.add = function(other) {
	for(let i = 0; i < Math.min(this.length, other.length); i++)
		this[i] += other[i];
	return this;
}
Array.prototype.subtract = function(other) {
	for(let i = 0; i < Math.min(this.length, other.length); i++)
		this[i] -= other[i];
	return this;
}