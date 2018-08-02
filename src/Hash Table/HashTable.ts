export class HashTable<T> {
	constructor(public storageLimit: number = 0, private storage: Array<Array<Array<String | T>>> = []) {}

	log(): void {
		console.log(this.storage);
	}

	add(key: string, value: T): void {
		const index = this.hash(key, this.storageLimit);
		if (this.storage[index] === undefined) {
			this.storage[index] = [[key, value]];
		} else {
			var inserted = false;
			for (var i = 0; i < this.storage[index].length; i++) {
				if (this.storage[index][i][0] === key) {
					this.storage[index][i][1] = value;
					inserted = true;
				}
			}
			if (inserted === false) {
				this.storage[index].push([key, value]);
			}
		}
	}

	remove(key: string): void {
		const index = this.hash(key, this.storageLimit);
		if (this.storage[index].length === 1 && this.storage[index][0][0] === key) {
			delete this.storage[index];
		} else {
			for (let i = 0; i < this.storage[index].length; i++) {
				if (this.storage[index][i][0] === key) {
					delete this.storage[index][i];
				}
			}
		}
	}

	lookup(key: string): String | T {
		const index = this.hash(key, this.storageLimit);
		if (this.storage[index] === undefined) {
			return undefined;
		} else {
			for (let i = 0; i < this.storage[index].length; i++) {
				if (this.storage[index][i][0] === key) {
					return this.storage[index][i][1];
				}
			}
		}
	}

	hash(string: string, max: number): number {
		let hash = 0;
		for (let i = 0; i < string.length; i++) {
			hash += string.charCodeAt(i);
		}
		return hash % max;
	}
}
