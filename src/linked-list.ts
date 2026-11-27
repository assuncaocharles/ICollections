import { sameValueZero } from './internal/equality.js';

/** A node of a {@link LinkedList}. */
export class LinkedListNode<T> {
	next: LinkedListNode<T> | null = null;

	constructor(public data: T) {}
}

/**
 * Singly linked list. Appending and prepending are O(1); index-based access is O(n).
 *
 * Values are compared with SameValueZero (like `Array.prototype.includes`).
 */
export class LinkedList<T> implements Iterable<T> {
	#head: LinkedListNode<T> | null = null;
	#tail: LinkedListNode<T> | null = null;
	#size = 0;

	/** Creates a list holding `values`, in order. */
	constructor(values?: Iterable<T>) {
		if (values) for (const value of values) this.add(value);
	}

	/** Number of elements in the list. */
	get size(): number {
		return this.#size;
	}

	/** Whether the list has no elements. */
	get isEmpty(): boolean {
		return this.#size === 0;
	}

	/**
	 * First node of the list, or `null` when empty.
	 *
	 * Read the nodes but do not relink them: the list tracks its size and tail separately.
	 */
	get head(): LinkedListNode<T> | null {
		return this.#head;
	}

	/** Last node of the list, or `null` when empty. */
	get tail(): LinkedListNode<T> | null {
		return this.#tail;
	}

	/** Appends an element to the end of the list. */
	add(data: T): this {
		const node = new LinkedListNode(data);
		if (this.#tail) this.#tail.next = node;
		else this.#head = node;
		this.#tail = node;
		this.#size++;
		return this;
	}

	/**
	 * Inserts an element so that it ends up at `index`.
	 *
	 * @throws {RangeError} If `index` is not an integer between `0` and `size`.
	 */
	addAt(index: number, data: T): this {
		this.#assertIndex(index, this.#size);
		if (index === this.#size) return this.add(data);
		const node = new LinkedListNode(data);
		if (index === 0) {
			node.next = this.#head;
			this.#head = node;
		} else {
			const previous = this.#nodeAt(index - 1);
			node.next = previous.next;
			previous.next = node;
		}
		this.#size++;
		return this;
	}

	/** Removes the first element equal to `data`. Returns `false` if there was none. */
	remove(data: T): boolean {
		let previous: LinkedListNode<T> | null = null;
		for (let current = this.#head; current; previous = current, current = current.next) {
			if (sameValueZero(current.data, data)) {
				this.#unlink(previous, current);
				return true;
			}
		}
		return false;
	}

	/**
	 * Removes the element at `index` and returns it.
	 *
	 * @throws {RangeError} If `index` is not an integer between `0` and `size - 1`.
	 */
	removeAt(index: number): T {
		this.#assertIndex(index, this.#size - 1);
		const previous = index === 0 ? null : this.#nodeAt(index - 1);
		const current = (previous ? previous.next : this.#head) as LinkedListNode<T>;
		this.#unlink(previous, current);
		return current.data;
	}

	/** Position of the first element equal to `data`, or `-1`. */
	indexOf(data: T): number {
		let index = 0;
		for (const value of this) {
			if (sameValueZero(value, data)) return index;
			index++;
		}
		return -1;
	}

	/** Whether the list holds an element equal to `data`. */
	has(data: T): boolean {
		return this.indexOf(data) !== -1;
	}

	/** The element at `index`, or `undefined` if out of range. */
	dataAt(index: number): T | undefined {
		if (!Number.isInteger(index) || index < 0 || index >= this.#size) return undefined;
		return this.#nodeAt(index).data;
	}

	/** Removes every element. */
	clear(): void {
		this.#head = this.#tail = null;
		this.#size = 0;
	}

	/** Elements from head to tail. */
	toArray(): T[] {
		return [...this];
	}

	/** Elements from head to tail, produced lazily. */
	*[Symbol.iterator](): IterableIterator<T> {
		for (let node = this.#head; node; node = node.next) yield node.data;
	}

	/** Caller guarantees `0 <= index < size`. */
	#nodeAt(index: number): LinkedListNode<T> {
		let node = this.#head as LinkedListNode<T>;
		for (let i = 0; i < index; i++) node = node.next as LinkedListNode<T>;
		return node;
	}

	#unlink(previous: LinkedListNode<T> | null, node: LinkedListNode<T>): void {
		if (previous) previous.next = node.next;
		else this.#head = node.next;
		if (this.#tail === node) this.#tail = previous;
		node.next = null;
		this.#size--;
	}

	#assertIndex(index: number, max: number): void {
		if (!Number.isInteger(index) || index < 0 || index > max) {
			throw new RangeError(`Index ${index} is out of range [0, ${max}]`);
		}
	}
}
