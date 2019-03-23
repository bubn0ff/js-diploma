'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	
	plus(vector) {
		if(!(vector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}
		return new Vector(this.x + vector.x, this.y + vector.y);
	}
	
	times(factor) {
		return new Vector(this.x * factor, this.y * factor);
	}
}

class Actor {
	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		if (!(pos instanceof Vector)){
			throw new Error('Должно быть определено свойство pos, в котором размещён Vector');
		}
		
		if (!(size instanceof Vector)){
			throw new Error('Должно быть определено свойство size, в котором размещён Vector');
		}
		
		if (!(speed instanceof Vector)){
			throw new Error('Должно быть определено свойство speed, в котором размещён Vector');
		}
		
		this.pos = pos;
		this.size = size;
		this.speed = speed;
	}
}