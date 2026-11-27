/** Minimal binary-tree shape the layout needs; `BSTNode` fits it. */
export interface BinaryNode<T> {
	data: T;
	left: BinaryNode<T> | null;
	right: BinaryNode<T> | null;
}

export interface PositionedNode<T> {
	node: BinaryNode<T>;
	/** Column: the node's position in an in-order walk. */
	x: number;
	/** Row: the node's depth. */
	y: number;
	parent: PositionedNode<T> | null;
}

export interface TreeLayout<T> {
	nodes: PositionedNode<T>[];
	columns: number;
	rows: number;
}

/**
 * Lays a binary tree out on a grid: each node gets its own column (its in-order index),
 * and its row is its depth. Edges never cross, and a binary search tree reads left to right in order.
 */
export function layoutTree<T>(root: BinaryNode<T> | null): TreeLayout<T> {
	const nodes: PositionedNode<T>[] = [];
	const stack: { node: BinaryNode<T>; depth: number; parent: PositionedNode<T> | null; expanded: boolean }[] = [];
	if (root) stack.push({ node: root, depth: 0, parent: null, expanded: false });
	const placed = new Map<BinaryNode<T>, PositionedNode<T>>();
	let column = 0;
	let rows = 0;

	// Iterative in-order walk that still knows each node's parent.
	while (stack.length > 0) {
		const frame = stack.pop()!;
		if (!frame.expanded) {
			const self = { node: frame.node, depth: frame.depth, parent: frame.parent, expanded: true };
			if (frame.node.right)
				stack.push({ node: frame.node.right, depth: frame.depth + 1, parent: null, expanded: false });
			stack.push(self);
			if (frame.node.left)
				stack.push({ node: frame.node.left, depth: frame.depth + 1, parent: null, expanded: false });
			continue;
		}
		const positioned: PositionedNode<T> = { node: frame.node, x: column++, y: frame.depth, parent: null };
		placed.set(frame.node, positioned);
		nodes.push(positioned);
		rows = Math.max(rows, frame.depth + 1);
	}

	for (const positioned of nodes) {
		for (const child of [positioned.node.left, positioned.node.right]) {
			const placedChild = child && placed.get(child);
			if (placedChild) placedChild.parent = positioned;
		}
	}
	return { nodes, columns: column, rows };
}
