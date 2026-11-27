/**
 * First-in, first-out collection with amortised O(1) `enqueue` and `dequeue`.
 */
export class Queue<T> implements Iterable<T> {
	#items: T[] = [];
	/** Index of the front element in `#items`; slots before it are spent. */
	#head = 0;

	/** Creates a queue holding `values`, the first one at the front. */
	constructor(values?: Iterable<T>) {
		if (values) for (const value of values) this.#items.push(value);
	}

	/** Number of elements in the queue. */
	get size(): number {
		return this.#items.length - this.#head;
	}

	/** Whether the queue has no elements. */
	get isEmpty(): boolean {
		return this.size === 0;
	}

	/** The element at the front of the queue, without removing it. */
	get front(): T | undefined {
		return this.isEmpty ? undefined : this.#items[this.#head];
	}

	/** Adds one or more elements to the back of the queue and returns the new size. */
	enqueue(...values: T[]): number {
		this.#items.push(...values);
		return this.size;
	}

	/** Removes and returns the element at the front of the queue. */
	dequeue(): T | undefined {
		if (this.isEmpty) return undefined;
		const value = this.#items[this.#head] as T;
		// Drop the reference so the element can be garbage-collected.
		(this.#items as (T | undefined)[])[this.#head] = undefined;
		this.#head++;
		// Compact once the spent prefix is at least half of the backing array.
		if (this.#head * 2 >= this.#items.length) {
			this.#items = this.#items.slice(this.#head);
			this.#head = 0;
		}
		return value;
	}

	/** Removes every element. */
	clear(): void {
		this.#items = [];
		this.#head = 0;
	}

	/** Elements from front to back. */
	toArray(): T[] {
		return this.#items.slice(this.#head);
	}

	/** Elements from front to back. */
	*[Symbol.iterator](): IterableIterator<T> {
		for (let i = this.#head; i < this.#items.length; i++) yield this.#items[i] as T;
	}
}
