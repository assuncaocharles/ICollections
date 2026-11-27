/**
 * Last-in, first-out collection.
 *
 * Iteration and {@link Stack.toArray} go from the top of the stack to the bottom.
 */
export class Stack<T> implements Iterable<T> {
	readonly #items: T[] = [];

	constructor(values?: Iterable<T>) {
		if (values) for (const value of values) this.#items.push(value);
	}

	/** Number of elements in the stack. */
	get size(): number {
		return this.#items.length;
	}

	get isEmpty(): boolean {
		return this.#items.length === 0;
	}

	/** The element on top of the stack, without removing it. */
	get peek(): T | undefined {
		return this.#items.at(-1);
	}

	/** Pushes one or more elements and returns the new size. */
	push(...values: T[]): number {
		return this.#items.push(...values);
	}

	/** Removes and returns the element on top of the stack. */
	pop(): T | undefined {
		return this.#items.pop();
	}

	clear(): void {
		this.#items.length = 0;
	}

	/** Elements from top to bottom. */
	toArray(): T[] {
		return this.#items.toReversed();
	}

	*[Symbol.iterator](): IterableIterator<T> {
		for (let i = this.#items.length - 1; i >= 0; i--) yield this.#items[i] as T;
	}
}
