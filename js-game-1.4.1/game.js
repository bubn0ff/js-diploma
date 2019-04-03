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

		if (!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
			throw new Error(`Одно из переданных свойств - ${pos}, ${size}, ${speed} - не является экземпляром класса Vector`);
		}
	}

	act() {}

	
	// A object boundaries - left, right, top, bottom.
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
			throw new Error(`Объект ${actor} не передан или не является экземпляром класса Actor`);
		}

		// The object doesn't intersect with itself.
		if (this === actor) {
			return false;
		}

		// The object doesn't intersect with an object with adjacent borders.
		if ((this.pos.x === actor.pos.x + actor.size.x) || (actor.pos.x === this.pos.x + this.size.x) || 
		(this.pos.y === actor.pos.y + actor.size.y) || (actor.pos.y === this.pos.y + this.size.y)) {
			return false;
		}

		// The object doesn't intersect with an object located at the same point, but having a vector of negative size.
		if (actor.size.x < 0 || actor.size.y < 0) {
			return false;
		}

		/* The object intersects with an object that is fully or partially contained in it
		(obviously, that the object doesn't intersect with an object located very far away). */
		return (this.pos.x <= actor.pos.x && this.pos.x + this.size.x >= actor.pos.x && 
		 this.pos.y <= actor.pos.y && this.pos.y + this.size.y >= actor.pos.y) || 
		 (this.pos.x <= actor.pos.x + actor.size.x && this.pos.x + this.size.x >= actor.pos.x + actor.size.x && 
		 this.pos.y <= actor.pos.y + actor.size.y && this.pos.y + this.size.y >= actor.pos.y + actor.size.y);
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
				if (typeof arr != 'undefined' && this.width < arr.length) {
					this.width = arr.length;
				}
			}
		}
	}

	isFinished() {
		return this.status != null && this.finishDelay < 0;
	}

	actorAt(actor) {
		if(!(actor instanceof Actor)) {
			throw new Error(`Объект ${actor} не передан или не является экземпляром класса Actor`);
		}
		
		// Returns the object of the playing field, which intersects with the transferred object.
		return this.actors.find(el => el.isIntersect(actor));
	}

	obstacleAt(pos, size) {
		if(!(pos instanceof Vector && size instanceof Vector)) {
			throw new Error(`Один из аргументов - ${pos}, ${size} - не является экземпляром класса Vector`);
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

		// if the area intersects with the wall and the object has non-integer coordinates and size
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

	noMoreActors(type) {
		for(const actor of this.actors) {
			if (actor.type === type) {
				return false;
			}
		}		

		return true;
	}

	playerTouched(type, actor) {
		if (type === 'lava' || type === 'fireball') {
			this.status = 'lost';
		}
		
		if (type === 'coin' && actor.type === 'coin') {
			this.removeActor(actor);
			if (this.noMoreActors('coin')) {
				this.status = 'won';
			}
		}
	}
}

class LevelParser {
	constructor(dictionary) {
		this.dictionary = dictionary;
	}

	actorFromSymbol(symbol) {
		return (typeof symbol === 'undefined' || typeof this.dictionary === 'undefined') ? undefined : this.dictionary[symbol];
	}

	obstacleFromSymbol(symbol) {
		const symbols = {
			'x': 'wall',
			'!': 'lava'
		}

		return symbols[symbol];
	}

	createGrid(strings) {
		const array = [];
		let i = 0;
		
		for(const string of strings) {
			array[i] = [];
			
			for(let j = 0; j < string.length; j++) {
				const symbol = string.charAt(j);
				if (symbol) {
					array[i].push(this.obstacleFromSymbol(symbol));
				} else {
					array[i].push(undefined);
				}
			}
			
			i++;
		}
		
		return array;
	}

	createActors(strings) {
		const array = [];
		let i = 0;

		for(let y = 0; y < strings.length; y++) {
			const string = strings[y];

			for(let x = 0; x < string.length; x++) {
				const symbol = string.charAt(x);
				const actorConstructor = this.actorFromSymbol(symbol);
				
				if (typeof actorConstructor === 'function') {
					const actor = new actorConstructor();
				
					if (actor instanceof Actor) {
						array[i] = new actorConstructor();
						array[i].pos = new Vector(x, y);
						i++;
					}
				}
			}
		}

		return array;
	}

	// returns the playing field filled with obstacles and moving objects
	parse(strings) {
		return new Level(this.createGrid(strings), this.createActors(strings));
	}
}

class Fireball extends Actor {
	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		super(pos, new Vector(1, 1), speed);
	}

	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	}

	// Handles a fireball strike with an obstacle.
	handleObstacle() {
		this.speed = this.speed.times(-1);
	}

	// Updates the state of a moving fireball.
	act(time, level) {
    const nextPosition = this.getNextPosition(time);
		if (level.obstacleAt(nextPosition, this.size)) {
			this.handleObstacle();
		} else {
			this.pos = nextPosition;
		}
	}
}

class HorizontalFireball extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(2, 0));
	}
}

class VerticalFireball extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0, 2));
	}
}

class FireRain extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0, 3));
		this.initPosition = pos;
	}

	handleObstacle() {
		this.pos = this.initPosition;
	}
}

class Coin extends Actor {
	constructor(pos = new Vector(1, 1)) {
		super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
		this.position = this.pos;
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * Math.PI * 2;
	}

	get type() {
		return 'coin';
	}

	// Updates the bouncing phase.
	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);
    return this.position.plus(this.getSpringVector());
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(pos = new Vector(0, 0)) {
		super(new Vector(pos.x + 0, pos.y - 0.5), new Vector(0.8, 1.5));
	}

	get type() {
		return 'player';
	}
}

const schema = [
  [
    '         ',
    '   |     ',
    '       o ',
    '      xxx',
    '@        ',
    '         ',
    'xxx      ',
    '!!!!!!!!!'
  ],
  [
    '         ',
    '@        ',
    '         ',
    'x    |  o',
    '    o   x',
    '   xx    ',
    '         ',
    '!!!      '
  ],
   [
    '         ',
    '  =      ',
    'o        ',
    'x        ',
    '    x   @',
    'o      xx',
    'xx|      ',
    '!!!!!!!!!'
  ],
   [
    '    @    ',
    '         ',
    '    xx   ',
    '=  |   o ',
    '       xx',
    'oo       ',
    'xxx      ',
    '         '
  ],
  [
    '!!!!!!!!!',
    '         ',
    '@        ',
    'xxx      ',
    '=  |  |  ',
    '    o    ',
    '    x    ',
    '!!!!!!!!!'
  ]
];

const actorDict = {
  '@': Player,
  'o': Coin,
  '|': VerticalFireball,
  '=': HorizontalFireball,
  'v': FireRain
}

const parser = new LevelParser(actorDict);
runGame(schema, parser, DOMDisplay)
  .then(() => alert('Ура, Вы выиграли!'));