const NativeSet = globalThis.Set;

/** Anything that can answer membership questions, such as this `Set` or the built-in one. */
export interface SetLike<T> {
	has(value: T): boolean;
}

/**
 * Collection of unique values with set algebra. Values are compared with SameValueZero
 * (like the built-in `Set`), so objects are compared by reference. Iteration follows insertion order.
 */
export class Set<T> implements Iterable<T>, SetLike<T> {
	readonly #items: globalThis.Set<T>;

	/** Creates a set holding the unique `values`. */
	constructor(values?: Iterable<T>) {
		this.#items = new NativeSet(values);
	}

	/** Number of values in the set. */
	get size(): number {
		return this.#items.size;
	}

	/** Whether the set has no elements. */
	get isEmpty(): boolean {
		return this.#items.size === 0;
	}

	/** A snapshot of the values, in insertion order. */
	get values(): T[] {
		return [...this.#items];
	}

	/** Whether the set holds `value`. */
	has(value: T): boolean {
		return this.#items.has(value);
	}

	/** Adds a value. Returns `false` if it was already present. */
	add(value: T): boolean {
		if (this.#items.has(value)) return false;
		this.#items.add(value);
		return true;
	}

	/** Removes a value. Returns `false` if it was not present. */
	remove(value: T): boolean {
		return this.#items.delete(value);
	}

	/** Removes every element. */
	clear(): void {
		this.#items.clear();
	}

	/** A new set with the values of both sets. */
	union<U>(other: Iterable<U>): Set<T | U> {
		const result = new Set<T | U>(this);
		for (const value of other) result.add(value);
		return result;
	}

	/** A new set with the values present in both sets. */
	intersection(other: SetLike<T>): Set<T> {
		return this.#filter((value) => other.has(value));
	}

	/** A new set with the values of this set that are not in `other`. */
	difference(other: SetLike<T>): Set<T> {
		return this.#filter((value) => !other.has(value));
	}

	/** Whether every value of this set is also in `other`. */
	subset(other: SetLike<T>): boolean {
		for (const value of this.#items) if (!other.has(value)) return false;
		return true;
	}

	/** The values, in insertion order. Same as {@link Set.values}. */
	toArray(): T[] {
		return this.values;
	}

	/** The values, in insertion order. */
	[Symbol.iterator](): IterableIterator<T> {
		return this.#items.values();
	}

	#filter(predicate: (value: T) => boolean): Set<T> {
		const result = new Set<T>();
		for (const value of this.#items) if (predicate(value)) result.#items.add(value);
		return result;
	}
}
