'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	
	plus(vector) {
		if(!(vector instanceof Vector)) {
			throw new Error('ћожно прибавл€ть к вектору только вектор типа Vector');
		}
		return new Vector(this.x + vector.x, this.y + vector.y);
	}
	
	times(factor) {
		return new Vector(this.x * factor, this.y * factor);
	}
}

class Actor {
	constructor() {
		
	}
}