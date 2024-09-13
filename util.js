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

function CreateLetterbox(rect, box_width, box_height, scale_x = true, scale_y = true) {
	let ret = new DOMRect(0, 0, box_width, box_height);
	console.log(ret);

	// get scaling factors for dimensions
	let aspect_box = box_width / box_height;
	let aspect_rect = rect.width / rect.height;

	let scalar = aspect_rect / aspect_box;

	console.log(aspect_box, aspect_rect, scalar);

	if (aspect_rect == 1) {
		if (box_width > box_height) {
			ret.width = box_height;
			ret.height = box_height;
		}
		else {
			ret.width = box_width;
			ret.height = box_width;
		}
		
		ret.x = (box_width/2) - (ret.width/2);
		ret.y = (box_height/2) - (ret.height/2);
	}
	else {
		if (rect.width < rect.height) {
			// for when the width is bigger than the height (ie 16:9)
			if (scale_y)
				ret.height = box_height * scalar;
			ret.y = ((box_height - ret.height) / 2);
		}
		else {
			// for when the height is bigger than the width (ie 9:16)
			// i still don't know why the math checks out here, but it does
			if (scale_x)
				ret.width = box_height * (aspect_box / scalar);
			ret.x = ((box_width - ret.width) / 2);
		}
	}

	console.log(ret);
	return ret;
}

// Extensions

Math.Clamp = function(num, min, max) {
	return Math.min(Math.max(num, min), max);
};

DOMRectReadOnly.prototype.relativeCenter = function(floor = false) {
	if (floor)
		return [Math.floor(this.width/2.0), Math.floor(this.height/2.0)];
	return [this.width/2.0, this.height/2.0];
}
DOMRect.prototype.scale = function(scale = 1.0) {
	this.x *= scale;
	this.y *= scale;
	this.width *= scale;
	this.height *= scale;
	return this;
}
DOMRect.prototype.floor = function() {
	this.x = Math.floor(this.x);
	this.y = Math.floor(this.y);
	this.width = Math.floor(this.width);
	this.height = Math.floor(this.height);
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