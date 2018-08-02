export class Stack<T> {
	constructor(public count: number = 0, public storage: { [key: number]: T } = {}) {}

	push(val: T) {
		this.storage[this.count] = val;
		this.count++;
	}

	pop(): T {
		if (this.count === 0) {
			return undefined;
		}
		this.count--;
		var result = this.storage[this.count];
		delete this.storage[this.count];
		return result;
	}

	get size(): number {
		return this.count;
	}

	get peek(): T {
		return this.storage[this.count - 1];
	}
}
