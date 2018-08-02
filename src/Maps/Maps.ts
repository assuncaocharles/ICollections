export class Map<T> {
	constructor(public collection: { [key: string]: T } = {}, public count: number = 0) {}

	get size(): number {
		return this.count;
	}

	set(key: any, value: T): void {
		this.collection[key] = value;
		this.count++;
	}

	has(key: any): boolean {
		return key in this.collection;
	}

	get(key: any): T {
		return key in this.collection ? this.collection[key] : null;
	}

	delete(key: any): void {
		if (key in this.collection) {
			delete this.collection[key];
			this.count--;
		}
	}

	get values(): Array<T> {
		let result = new Array();
		for (let key of Object.keys(this.collection)) {
			result.push(this.collection[key]);
		}
		return result.length > 0 ? result : null;
	}

	clear(): void {
		this.collection = {};
		this.count = 0;
	}
}
