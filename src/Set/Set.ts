export class Set<T> {
	constructor(public collection: Array<T> = []) {}

	// this method will check for the presence of an element and return true or false
	has(element: T): boolean {
		return this.collection.indexOf(element) !== -1;
	}

	// this method will return all the values in the set
	get values(): Array<T> {
		return this.collection;
	}

	// this method will add an element to the set
	add(element: T): boolean {
		if (!this.has(element)) {
			this.collection.push(element);
			return true;
		}
		return false;
	}

	// this method will remove an element from a set
	remove(element: T): boolean {
		if (this.has(element)) {
			let index = this.collection.indexOf(element);
			this.collection.splice(index, 1);
			return true;
		}
		return false;
	}

	// this method will return the size of the collection
	get size(): number {
		return this.collection.length;
	}

	// this method will return the union of two sets
	union(otherSet: Set<T>) {
		var unionSet = new Set();
		var firstSet = this.values;
		var secondSet = otherSet.values;
		firstSet.forEach(function(e) {
			unionSet.add(e);
		});
		secondSet.forEach(function(e) {
			unionSet.add(e);
		});
		return unionSet;
	}

	// this method will return the intersection of two sets as a new set
	intersection(otherSet: Set<T>) {
		var intersectionSet = new Set();
		var firstSet = this.values;
		firstSet.forEach(function(e) {
			if (otherSet.has(e)) {
				intersectionSet.add(e);
			}
		});
		return intersectionSet;
	}

	// this method will return the difference of two sets as a new set
	difference(otherSet: Set<T>) {
		var differenceSet = new Set();
		var firstSet = this.values;
		firstSet.forEach(function(e) {
			if (!otherSet.has(e)) {
				differenceSet.add(e);
			}
		});
		return differenceSet;
	}

	// this method will test if the set is a subset of a different set
	subset(otherSet: Set<T>) {
		var firstSet = this.values;
		return firstSet.every(function(value) {
			return otherSet.has(value);
		});
	}
}
