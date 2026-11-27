import { describe, expect, it } from 'vitest';
import { BST } from '../../../src/index.js';
import { layoutTree } from './layout.js';

describe('layoutTree', () => {
	it('lays out an empty tree', () => {
		expect(layoutTree(null)).toEqual({ nodes: [], columns: 0, rows: 0 });
	});

	it('assigns in-order columns and depth rows', () => {
		const bst = new BST([10, 5, 13, 2, 12]);
		const layout = layoutTree(bst.root);
		expect(layout.columns).toBe(5);
		expect(layout.rows).toBe(3);
		expect(layout.nodes.map(({ node, x, y }) => [node.data, x, y])).toEqual([
			[2, 0, 2],
			[5, 1, 1],
			[10, 2, 0],
			[12, 3, 2],
			[13, 4, 1],
		]);
	});

	it('links every node to its parent', () => {
		const layout = layoutTree(new BST([10, 5, 13, 2]).root);
		const parents = Object.fromEntries(layout.nodes.map((n) => [n.node.data, n.parent?.node.data ?? null]));
		expect(parents).toEqual({ 10: null, 5: 10, 13: 10, 2: 5 });
	});

	it('handles deep trees without recursion', () => {
		const layout = layoutTree(new BST(Array.from({ length: 3000 }, (_, i) => i)).root);
		expect(layout.rows).toBe(3000);
		expect(layout.nodes.at(-1)?.x).toBe(2999);
	});
});
