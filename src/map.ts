const NativeMap = globalThis.Map;

/**
 * Key/value collection. Keys can be of any type and are compared with SameValueZero
 * (like the built-in `Map`), so object keys are compared by reference. Iteration follows insertion order.
 */
export class Map<K, V> implements Iterable<[K, V]> {
	readonly #entries: globalThis.Map<K, V>;

	/** Creates a map holding `[key, value]` `entries`. */
	constructor(entries?: Iterable<readonly [K, V]>) {
		this.#entries = new NativeMap(entries);
	}

	/** Number of entries in the map. */
	get size(): number {
		return this.#entries.size;
	}

	/** Whether the map has no elements. */
	get isEmpty(): boolean {
		return this.#entries.size === 0;
	}

	/** A snapshot of the keys, in insertion order. */
	get keys(): K[] {
		return [...this.#entries.keys()];
	}

	/** A snapshot of the values, in insertion order. */
	get values(): V[] {
		return [...this.#entries.values()];
	}

	/** A snapshot of the `[key, value]` entries, in insertion order. */
	get entries(): [K, V][] {
		return [...this.#entries];
	}

	/** Adds or replaces the value for `key`. */
	set(key: K, value: V): this {
		this.#entries.set(key, value);
		return this;
	}

	/** Whether the map has an entry for `key`. */
	has(key: K): boolean {
		return this.#entries.has(key);
	}

	/** The value for `key`, or `undefined`. */
	get(key: K): V | undefined {
		return this.#entries.get(key);
	}

	/** Removes the entry for `key`. Returns `false` if there was none. */
	delete(key: K): boolean {
		return this.#entries.delete(key);
	}

	/** Removes every element. */
	clear(): void {
		this.#entries.clear();
	}

	/** The `[key, value]` entries, in insertion order. */
	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.#entries.entries();
	}
}
