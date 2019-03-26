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
		this.pos = pos;
		this.size = size;
		this.speed = speed;

		if (!(pos instanceof Vector)) {
			throw new Error('Должно быть определено свойство pos, в котором размещён Vector');
		}
		
		if (!(size instanceof Vector)) {
			throw new Error('Должно быть определено свойство size, в котором размещён Vector');
		}
		
		if (!(speed instanceof Vector)) {
			throw new Error('Должно быть определено свойство speed, в котором размещён Vector');
		}
	}

	act() {}

	get left() {
		return this.pos.x;
	}

	get right() {
		return this.pos.x + this.size.x;
	}

	get top() {
		return this.pos.y;
	}

	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return 'actor';
	}

	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw new Error('Должно быть определено свойство actor, в котором размещён Actor');
		}

		// The object doesn't intersect with itself.
		if (this === actor) {
			return false;
		}

		// The object doesn't intersect with an object with adjacent borders.
		if ((this.pos.x === actor.pos.x + actor.size.x) || (actor.pos.x === this.pos.x + actor.size.x) || 
		(this.pos.y === actor.pos.y + actor.size.y) || (actor.pos.y === this.pos.y + actor.size.y)) {
			return false;
		}

		// The object doesn't intersect with an object located at the same point, but having a vector of negative size.
		if (actor.size.x < 0 || actor.size.y < 0) {
			return false;
		}

		/* The object doesn't intersect with an object located very far away 
		and  intersects with an object that is fully or partially contained in it. */
		return (this.pos.x <= actor.pos.x + actor.size.x && this.pos.x >= actor.pos.x && 
		 this.pos.y + this.size.y <= actor.pos.y + actor.size.y && this.pos.y + this.size.y >= actor.pos.y) ||
		 (this.pos.y <= actor.pos.y + actor.size.y && this.pos.y >= actor.pos.y && 
		 this.pos.x + this.size.x <= actor.pos.x + actor.size.x && this.pos.x + this.size.x >= actor.pos.x) || 
		 (actor.pos.x <= this.pos.x + this.size.x && actor.pos.x >= this.pos.x && 
		 actor.pos.y <= this.pos.y + this.size.y && actor.pos.y >= this.pos.y) || 
		 (actor.pos.x + actor.size.x <= this.pos.x + this.size.x && actor.pos.x + actor.size.x >= this.pos.x && 
		 actor.pos.y + actor.size.y <= this.pos.y + this.size.y && actor.pos.y + actor.size.y >= this.pos.y);
	}
}

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.height = grid.length;
		this.width = 0;
		this.status = null;
		this.finishDelay = 1;

		for(const actor of actors) {
			if (actor.type === 'player') {
				this.player = actor;
				break;
			}
		}

		/* The level width is equal to the number of grid cells. If in the rows have a different number of cells, 
		then the level width is equal to the number of cells in the longest row. */
		if (grid.length !== 0) {
			for(const arr of this.grid) {
				if (typeof arr != 'undefined') {
					if (this.width < arr.length) {
						this.width = arr.length;
					}
				}
			}
		}
	}

	isFinished() {
		return (this.status != null && this.finishDelay < 0);
	}

	actorAt(actor) {
		if(!(actor instanceof Actor)) {
			throw new Error('Движущийся объект должен иметь тип Actor');
		}
		
		// Returns the object of the playing field, which intersects with the transferred object.
		for(const act of this.actors) {
			if (typeof act != 'undefined' && actor.isIntersect(act)) {
				return act;
			}
		}

		return undefined;	
	}

	obstacleAt(pos, size) {
		if(!(pos instanceof Vector)) {
			throw new Error('Движущийся объект pos должен иметь тип Vector');
		}

		if(!(size instanceof Vector)) {
			throw new Error('Движущийся объект size должен иметь тип Vector');
		}

		const xStart = Math.floor(pos.x);
		const yStart = Math.floor(pos.y);
		const xEnd = Math.ceil(pos.x + size.x);
		const yEnd = Math.ceil(pos.y + size.y);

		// if the left, right and top of the object are outside the level
		if (xStart < 0 || xEnd > this.width || yStart < 0) {
			return 'wall';
		}

		// if the bottom of the object are outside the level
		if (yEnd > this.height) {
			return 'lava';
		}

		/* returns string "wall" if the area intersects with the wall and the object has non-integer coordinates and size
		   returns string "lava" if the area intersects with the lava */
		for(let y = yStart; y < yEnd; y++) {
			for(let x = xStart; x < xEnd; x++) {
				const obstacle = this.grid[y][x];
				if (typeof obstacle !== 'undefined') {
					return obstacle;
				}
			}
		}
	}

	removeActor(actor) {
		const indexActor = this.actors.indexOf(actor);
		if (indexActor != -1) {
			this.actors.splice(indexActor, 1);
		}
	}
}