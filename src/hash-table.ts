type Bucket<V> = [key: string, value: V][];

const DEFAULT_STORAGE_LIMIT = 32;

/**
 * Hash table with string keys and separate chaining.
 *
 * `storageLimit` is the number of buckets. It never limits how many entries the table holds,
 * but the more entries share a bucket, the closer lookups get to O(n).
 */
export class HashTable<V> implements Iterable<[string, V]> {
	readonly storageLimit: number;
	readonly #buckets: (Bucket<V> | undefined)[];
	#size = 0;

	constructor(storageLimit: number = DEFAULT_STORAGE_LIMIT) {
		if (!Number.isInteger(storageLimit) || storageLimit < 1) {
			throw new RangeError(`storageLimit must be a positive integer, received ${storageLimit}`);
		}
		this.storageLimit = storageLimit;
		this.#buckets = Array.from({ length: storageLimit });
	}

	/** Number of entries in the table. */
	get size(): number {
		return this.#size;
	}

	get isEmpty(): boolean {
		return this.#size === 0;
	}

	/** Adds the entry, or replaces the value if `key` is already present. */
	add(key: string, value: V): this {
		const index = this.hash(key);
		const bucket = (this.#buckets[index] ??= []);
		const entry = bucket.find(([entryKey]) => entryKey === key);
		if (entry) {
			entry[1] = value;
		} else {
			bucket.push([key, value]);
			this.#size++;
		}
		return this;
	}

	/** Removes the entry for `key`. Returns `false` if there was none. */
	remove(key: string): boolean {
		const index = this.hash(key);
		const bucket = this.#buckets[index];
		const position = bucket?.findIndex(([entryKey]) => entryKey === key) ?? -1;
		if (!bucket || position === -1) return false;
		bucket.splice(position, 1);
		if (bucket.length === 0) this.#buckets[index] = undefined;
		this.#size--;
		return true;
	}

	/** The value stored for `key`, or `undefined`. */
	lookup(key: string): V | undefined {
		return this.#buckets[this.hash(key)]?.find(([entryKey]) => entryKey === key)?.[1];
	}

	has(key: string): boolean {
		return this.#buckets[this.hash(key)]?.some(([entryKey]) => entryKey === key) ?? false;
	}

	clear(): void {
		this.#buckets.fill(undefined);
		this.#size = 0;
	}

	keys(): string[] {
		return Array.from(this, ([key]) => key);
	}

	values(): V[] {
		return Array.from(this, ([, value]) => value);
	}

	/**
	 * Bucket index for `key`, from a 32-bit FNV-1a hash.
	 *
	 * @param max Number of buckets. Defaults to {@link HashTable.storageLimit}.
	 */
	hash(key: string, max: number = this.storageLimit): number {
		let hash = 0x811c9dc5;
		for (let i = 0; i < key.length; i++) {
			hash ^= key.charCodeAt(i);
			hash = Math.imul(hash, 0x01000193);
		}
		return (hash >>> 0) % max;
	}

	/** Entries as `[key, value]` pairs, grouped by bucket. */
	*[Symbol.iterator](): IterableIterator<[string, V]> {
		for (const bucket of this.#buckets) {
			if (bucket) for (const [key, value] of bucket) yield [key, value];
		}
	}
}
