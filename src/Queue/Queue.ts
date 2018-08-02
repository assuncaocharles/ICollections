export class Queue<T> {
	constructor(public collection: Array<T> = []) {}

	print(): void {
		console.log(this.collection);
	}

	enqueue(element: T) {
		this.collection.push(element);
	}

	dequeue(): T {
		return this.collection.shift();
	}

	get front(): T {
		return this.collection[0];
	}

	get size(): number {
		return this.collection.length;
	}

	get isEmpty(): boolean {
		return this.collection.length === 0;
	}
}
