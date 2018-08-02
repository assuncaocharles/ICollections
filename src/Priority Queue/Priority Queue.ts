export class PriorityQueue<T> {
	constructor(public collection: Array<Array<T | number>> = []) {}

	printCollection(): void {
		console.log(this.collection);
	}

	enqueue(element: Array<T | number>): void {
		if (this.isEmpty()) {
			this.collection.push(element);
		} else {
			let added = false;
			for (let i = 0; i < this.collection.length; i++) {
				if (element[1] < this.collection[i][1]) {
					this.collection.splice(i, 0, element);
					added = true;
					break;
				}
			}
			if (!added) {
				this.collection.push(element);
			}
		}
	}

	dequeue(): T | number {
		const value = this.collection.shift();
		return value[0];
	}

	get front(): Array<T | number> {
		return this.collection[0];
	}

	get size(): number {
		return this.collection.length;
	}

	isEmpty(): boolean {
		return this.collection.length === 0;
	}
}
