import { type Comparator, defaultCompare } from './internal/compare.js';

/** A node of a {@link BST}. */
export class BSTNode<T> {
	constructor(
		public data: T,
		public left: BSTNode<T> | null = null,
		public right: BSTNode<T> | null = null,
	) {}
}

/**
 * Unbalanced binary search tree of unique values.
 *
 * Values are ordered with `<` and `>` by default; pass a {@link Comparator} to order anything else.
 * Every operation is iterative, so degenerate (list-shaped) trees cannot overflow the call stack.
 * Iteration and {@link BST.toArray} yield values in order.
 */
export class BST<T> implements Iterable<T> {
	#root: BSTNode<T> | null = null;
	#size = 0;
	#compare: Comparator<T>;

	/** Creates a tree holding `values`, ordered by `compare`. */
	constructor(values?: Iterable<T>, compare: Comparator<T> = defaultCompare) {
		this.#compare = compare;
		if (values) for (const value of values) this.add(value);
	}

	/**
	 * Root node, or `null` when empty.
	 *
	 * Read the nodes but do not relink them: the tree tracks its size separately.
	 */
	get root(): BSTNode<T> | null {
		return this.#root;
	}

	/** Number of values in the tree. */
	get size(): number {
		return this.#size;
	}

	/** Whether the tree has no elements. */
	get isEmpty(): boolean {
		return this.#size === 0;
	}

	/** Inserts a value. Returns `false` if an equivalent value was already present. */
	add(data: T): boolean {
		const node = new BSTNode(data);
		if (!this.#root) {
			this.#root = node;
			this.#size++;
			return true;
		}
		let current = this.#root;
		while (true) {
			const order = this.#compare(data, current.data);
			if (order === 0) return false;
			const side = order < 0 ? 'left' : 'right';
			const child = current[side];
			if (!child) {
				current[side] = node;
				this.#size++;
				return true;
			}
			current = child;
		}
	}

	/** Smallest value, or `undefined` when empty. */
	findMin(): T | undefined {
		let current = this.#root;
		while (current?.left) current = current.left;
		return current?.data;
	}

	/** Largest value, or `undefined` when empty. */
	findMax(): T | undefined {
		let current = this.#root;
		while (current?.right) current = current.right;
		return current?.data;
	}

	/** Node holding `data`, or `null`. */
	find(data: T): BSTNode<T> | null {
		let current = this.#root;
		while (current) {
			const order = this.#compare(data, current.data);
			if (order === 0) return current;
			current = order < 0 ? current.left : current.right;
		}
		return null;
	}

	/** Whether the tree holds a value equivalent to `data`. */
	has(data: T): boolean {
		return this.find(data) !== null;
	}

	/** Alias of {@link BST.has}. */
	isPresent(data: T): boolean {
		return this.has(data);
	}

	/** Removes a value. Returns `false` if it was not present. */
	remove(data: T): boolean {
		let parent: BSTNode<T> | null = null;
		let node = this.#root;
		while (node) {
			const order = this.#compare(data, node.data);
			if (order === 0) break;
			parent = node;
			node = order < 0 ? node.left : node.right;
		}
		if (!node) return false;

		if (node.left && node.right) {
			// Two children: move the in-order successor's value here, then unlink the successor,
			// which has no left child.
			let successorParent = node;
			let successor = node.right;
			while (successor.left) {
				successorParent = successor;
				successor = successor.left;
			}
			node.data = successor.data;
			parent = successorParent;
			node = successor;
		}

		const child = node.left ?? node.right;
		if (!parent) this.#root = child;
		else if (parent.left === node) parent.left = child;
		else parent.right = child;
		this.#size--;
		return true;
	}

	/** Removes every element. */
	clear(): void {
		this.#root = null;
		this.#size = 0;
	}

	/** Whether {@link BST.findMinHeight} and {@link BST.findMaxHeight} differ by at most one. */
	isBalanced(): boolean {
		return this.findMinHeight() >= this.findMaxHeight() - 1;
	}

	/**
	 * Depth of the shallowest node below `node` (default: root) that is missing a child,
	 * i.e. where another value could be attached. `-1` for an empty tree.
	 */
	findMinHeight(node: BSTNode<T> | null = this.#root): number {
		let height = -1;
		for (const level of levels(node)) {
			height++;
			if (level.some((n) => !n.left || !n.right)) break;
		}
		return height;
	}

	/** Height of the subtree rooted at `node` (default: root). `-1` for an empty tree. */
	findMaxHeight(node: BSTNode<T> | null = this.#root): number {
		let height = -1;
		for (const _ of levels(node)) height++;
		return height;
	}

	/** Values in ascending order. */
	inOrder(): T[] {
		return [...this];
	}

	/** Values in pre-order: node, then left subtree, then right subtree. */
	preOrder(): T[] {
		const result: T[] = [];
		const stack = this.#root ? [this.#root] : [];
		for (let node = stack.pop(); node; node = stack.pop()) {
			result.push(node.data);
			if (node.right) stack.push(node.right);
			if (node.left) stack.push(node.left);
		}
		return result;
	}

	/** Values in post-order: left subtree, then right subtree, then node. */
	postOrder(): T[] {
		// Reverse of a node → right → left pre-order.
		const result: T[] = [];
		const stack = this.#root ? [this.#root] : [];
		for (let node = stack.pop(); node; node = stack.pop()) {
			result.push(node.data);
			if (node.left) stack.push(node.left);
			if (node.right) stack.push(node.right);
		}
		return result.reverse();
	}

	/** Values level by level, left to right (breadth-first). */
	levelOrder(): T[] {
		return [...levels(this.#root)].flat().map((node) => node.data);
	}

	/** @deprecated Alias of {@link BST.levelOrder}. */
	layers(): T[] {
		return this.levelOrder();
	}

	/**
	 * Mirrors the tree, swapping every left and right child.
	 *
	 * The tree stays searchable: from then on it orders values in reverse,
	 * so `inOrder()` returns them in descending order.
	 */
	invert(): void {
		const stack = this.#root ? [this.#root] : [];
		for (let node = stack.pop(); node; node = stack.pop()) {
			[node.left, node.right] = [node.right, node.left];
			if (node.left) stack.push(node.left);
			if (node.right) stack.push(node.right);
		}
		const compare = this.#compare;
		this.#compare = (a, b) => compare(b, a);
	}

	/** Height of the subtree rooted at `data`'s node (`0` for a leaf), or `-1` if absent. */
	elementHeight(data: T): number {
		const node = this.find(data);
		return node ? this.findMaxHeight(node) : -1;
	}

	/** Number of edges from the root to `data`'s node, or `-1` if absent. */
	elementDepth(data: T): number {
		let depth = 0;
		let current = this.#root;
		while (current) {
			const order = this.#compare(data, current.data);
			if (order === 0) return depth;
			current = order < 0 ? current.left : current.right;
			depth++;
		}
		return -1;
	}

	/** Values in ascending order. Same as {@link BST.inOrder}. */
	toArray(): T[] {
		return [...this];
	}

	/** Values in ascending order, produced lazily. */
	*[Symbol.iterator](): IterableIterator<T> {
		const stack: BSTNode<T>[] = [];
		let current = this.#root;
		while (current || stack.length > 0) {
			while (current) {
				stack.push(current);
				current = current.left;
			}
			const node = stack.pop() as BSTNode<T>;
			yield node.data;
			current = node.right;
		}
	}
}

/** Yields the nodes of each level below `root`, top to bottom. */
function* levels<T>(root: BSTNode<T> | null): Generator<BSTNode<T>[]> {
	let level = root ? [root] : [];
	while (level.length > 0) {
		yield level;
		level = level.flatMap((node) => [node.left, node.right].filter((child) => child !== null));
	}
}
