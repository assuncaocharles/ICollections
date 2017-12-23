export class Map {

	constructor() {
		this.collection = {};
		this.count = 0;
	}
	
	get size() {
		return this.count;
	}

	set(key, value) {
		this.collection[key] = value;
		this.count++;
	}

	has(key) {
		return (key in this.collection);
	}

	get(key) {
		return (key in this.collection) ? this.collection[key] : null;
	}

	delete(key) {
		if (key in this.collection) {
			delete this.collection[key];
			this.count--;
		}
	}

	get values() {
		let result = new Array();
		for (let key of Object.keys(this.collection)) {
			result.push(this.collection[key]);
		};
		return (result.length > 0) ? result : null;
	}

	clear(){
		this.collection = {};
		this.count = 0;
	}

};
