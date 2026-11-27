/** A value paired with its priority. Lower numbers are dequeued first. */
export type PriorityEntry<T> = readonly [value: T, priority: number];

interface HeapNode<T> {
	readonly value: T;
	readonly priority: number;
	/** Insertion order, used to keep equal priorities first-in, first-out. */
	readonly order: number;
}

/**
 * Min-priority queue backed by a binary heap: O(log n) `enqueue` and `dequeue`, O(1) `front`.
 *
 * Lower priority numbers come out first. Elements with equal priority come out in insertion order.
 */
export class PriorityQueue<T> implements Iterable<PriorityEntry<T>> {
	readonly #heap: HeapNode<T>[] = [];
	#counter = 0;

	/** Creates a queue holding `[value, priority]` `entries`. */
	constructor(entries?: Iterable<PriorityEntry<T>>) {
		if (entries) for (const entry of entries) this.enqueue(entry);
	}

	/** Number of elements in the queue. */
	get size(): number {
		return this.#heap.length;
	}

	/** Whether the queue has no elements. */
	get isEmpty(): boolean {
		return this.#heap.length === 0;
	}

	/** The next `[value, priority]` entry to be dequeued, without removing it. */
	get front(): PriorityEntry<T> | undefined {
		const top = this.#heap[0];
		return top && [top.value, top.priority];
	}

	/** Adds an element and returns the new size. */
	enqueue(entry: PriorityEntry<T>): number;
	enqueue(value: T, priority: number): number;
	enqueue(...args: [entry: PriorityEntry<T>] | [value: T, priority: number]): number {
		const [value, priority] = args.length === 2 ? args : args[0];
		if (Number.isNaN(priority)) throw new RangeError('Priority must not be NaN');
		this.#heap.push({ value, priority, order: this.#counter++ });
		this.#siftUp(this.#heap.length - 1);
		return this.#heap.length;
	}

	/** Removes and returns the value with the lowest priority. */
	dequeue(): T | undefined {
		const heap = this.#heap;
		const top = heap[0];
		const last = heap.pop();
		if (top === undefined || last === undefined) return undefined;
		if (heap.length > 0) {
			heap[0] = last;
			this.#siftDown(0);
		}
		return top.value;
	}

	/** Removes every element. */
	clear(): void {
		this.#heap.length = 0;
	}

	/** All entries in dequeue order. Does not modify the queue. */
	toArray(): PriorityEntry<T>[] {
		return this.#heap.toSorted(compareNodes).map(({ value, priority }) => [value, priority] as const);
	}

	/** Entries in dequeue order. Does not modify the queue. */
	[Symbol.iterator](): IterableIterator<PriorityEntry<T>> {
		return this.toArray()[Symbol.iterator]();
	}

	#siftUp(index: number): void {
		const heap = this.#heap;
		const node = heap[index] as HeapNode<T>;
		while (index > 0) {
			const parentIndex = (index - 1) >> 1;
			const parent = heap[parentIndex] as HeapNode<T>;
			if (compareNodes(node, parent) >= 0) break;
			heap[index] = parent;
			index = parentIndex;
		}
		heap[index] = node;
	}

	#siftDown(index: number): void {
		const heap = this.#heap;
		const length = heap.length;
		const node = heap[index] as HeapNode<T>;
		while (true) {
			const left = 2 * index + 1;
			if (left >= length) break;
			const right = left + 1;
			let child = left;
			if (right < length && compareNodes(heap[right] as HeapNode<T>, heap[left] as HeapNode<T>) < 0) {
				child = right;
			}
			const childNode = heap[child] as HeapNode<T>;
			if (compareNodes(childNode, node) >= 0) break;
			heap[index] = childNode;
			index = child;
		}
		heap[index] = node;
	}
}

function compareNodes<T>(a: HeapNode<T>, b: HeapNode<T>): number {
	return a.priority - b.priority || a.order - b.order;
}
