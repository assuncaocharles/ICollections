import { describe, expect, it } from 'vitest';
import { BST } from './binary-search-tree.js';

const sample = (): BST<number> => new BST([10, 5, 13, 2, 133, 42, 12]);

describe('BST', () => {
	it('starts empty', () => {
		const bst = new BST<number>();
		expect(bst.size).toBe(0);
		expect(bst.isEmpty).toBe(true);
		expect(bst.root).toBeNull();
		expect(bst.findMin()).toBeUndefined();
		expect(bst.findMax()).toBeUndefined();
		expect(bst.find(1)).toBeNull();
		expect(bst.inOrder()).toEqual([]);
		expect(bst.preOrder()).toEqual([]);
		expect(bst.postOrder()).toEqual([]);
		expect(bst.levelOrder()).toEqual([]);
		expect(bst.findMinHeight()).toBe(-1);
		expect(bst.findMaxHeight()).toBe(-1);
		expect(bst.isBalanced()).toBe(true);
		expect(bst.remove(1)).toBe(false);
		expect(() => bst.invert()).not.toThrow();
	});

	it('adds unique values', () => {
		const bst = new BST<number>();
		expect(bst.add(10)).toBe(true);
		expect(bst.add(5)).toBe(true);
		expect(bst.add(5)).toBe(false);
		expect(bst.size).toBe(2);
		expect(bst.isPresent(5)).toBe(true);
		expect(bst.has(10)).toBe(true);
		expect(bst.has(7)).toBe(false);
	});

	it('finds nodes', () => {
		const bst = sample();
		expect(bst.find(42)?.data).toBe(42);
		expect(bst.find(43)).toBeNull();
	});

	it('removes a node with two children', () => {
		const bst = new BST([10, 5, 13, 2]);
		expect(bst.remove(10)).toBe(true);
		expect(bst.isPresent(10)).toBe(false);
		expect(bst.inOrder()).toEqual([2, 5, 13]);
		expect(bst.size).toBe(3);
	});

	it('removes leaves, single-child nodes and the root', () => {
		const bst = sample();
		expect(bst.remove(2)).toBe(true); // leaf
		expect(bst.remove(133)).toBe(true); // one child
		expect(bst.remove(13)).toBe(true); // two children, successor is a direct child
		expect(bst.inOrder()).toEqual([5, 10, 12, 42]);
		expect(bst.remove(99)).toBe(false);
		for (const value of [10, 5, 12, 42]) expect(bst.remove(value)).toBe(true);
		expect(bst.root).toBeNull();
		expect(bst.size).toBe(0);
	});

	it('stays sorted under random inserts and removals', () => {
		const bst = new BST<number>();
		const reference = new globalThis.Set<number>();
		for (let i = 0; i < 2000; i++) {
			const value = Math.floor(Math.random() * 300);
			if (Math.random() < 0.6) {
				expect(bst.add(value)).toBe(!reference.has(value));
				reference.add(value);
			} else {
				expect(bst.remove(value)).toBe(reference.delete(value));
			}
		}
		expect(bst.inOrder()).toEqual([...reference].toSorted((a, b) => a - b));
		expect(bst.size).toBe(reference.size);
	});

	it('finds min and max', () => {
		const bst = sample();
		expect(bst.findMin()).toBe(2);
		expect(bst.findMax()).toBe(133);
	});

	it('determines whether it is balanced', () => {
		expect(new BST([10, 5, 13, 2]).isBalanced()).toBe(true);
		expect(new BST([1, 2, 3, 4]).isBalanced()).toBe(false);
	});

	it('computes min and max heights', () => {
		const bst = sample();
		expect(bst.findMinHeight()).toBe(1);
		expect(bst.findMaxHeight()).toBe(3);
		expect(bst.findMaxHeight(bst.find(13))).toBe(2);
	});

	it('traverses', () => {
		const bst = sample();
		expect(bst.inOrder()).toEqual([2, 5, 10, 12, 13, 42, 133]);
		expect(bst.preOrder()).toEqual([10, 5, 2, 13, 12, 133, 42]);
		expect(bst.postOrder()).toEqual([2, 5, 12, 42, 133, 13, 10]);
		expect(bst.levelOrder()).toEqual([10, 5, 13, 2, 12, 133, 42]);
		expect(bst.layers()).toEqual(bst.levelOrder());
		expect([...bst]).toEqual(bst.inOrder());
		expect(bst.toArray()).toEqual(bst.inOrder());
	});

	it('handles degenerate trees without overflowing the stack', () => {
		const bst = new BST(Array.from({ length: 15_000 }, (_, i) => i));
		expect(bst.findMaxHeight()).toBe(14_999);
		expect(bst.inOrder()).toHaveLength(15_000);
		expect(bst.postOrder()[0]).toBe(14_999);
		expect(bst.elementHeight(0)).toBe(14_999);
		expect(bst.remove(0)).toBe(true);
	}, 30_000); // Building a list-shaped tree is O(n²) by nature.

	it('inverts the tree and stays searchable', () => {
		const bst = new BST([10, 15, 5, 4, 6]);
		bst.invert();
		expect(bst.preOrder()).toEqual([10, 15, 5, 6, 4]);
		expect(bst.inOrder()).toEqual([15, 10, 6, 5, 4]);
		expect(bst.has(4)).toBe(true);
		bst.add(7);
		expect(bst.inOrder()).toEqual([15, 10, 7, 6, 5, 4]);
		expect(bst.findMin()).toBe(15);
	});

	it('inverts trees whose nodes have a single child', () => {
		const bst = new BST([10, 5, 3]);
		bst.invert();
		expect(bst.preOrder()).toEqual([10, 5, 3]);
		expect(bst.root?.right?.right?.data).toBe(3);
	});

	it('finds the height of an element', () => {
		const bst = new BST([10, 15, 20, 21, 22, 23, 5, 3, 1]);
		expect(bst.elementHeight(1)).toBe(0);
		expect(bst.elementHeight(3)).toBe(1);
		expect(bst.elementHeight(10)).toBe(5);
		expect(bst.elementHeight(1001)).toBe(-1);
	});

	it('finds the depth of an element', () => {
		const bst = new BST([10, 15, 5, 3, 1]);
		expect(bst.elementDepth(10)).toBe(0);
		expect(bst.elementDepth(15)).toBe(1);
		expect(bst.elementDepth(1)).toBe(3);
		expect(bst.elementDepth(10123)).toBe(-1);
		expect(bst.elementDepth(11)).toBe(-1);
	});

	it('accepts a custom comparator', () => {
		interface User {
			name: string;
			age: number;
		}
		const users = new BST<User>(
			[
				{ name: 'Ana', age: 31 },
				{ name: 'Bo', age: 25 },
				{ name: 'Cy', age: 40 },
			],
			(a, b) => a.age - b.age,
		);
		expect(users.findMin()?.name).toBe('Bo');
		expect(users.has({ name: 'anyone', age: 40 })).toBe(true);
		expect(users.inOrder().map((user) => user.name)).toEqual(['Bo', 'Ana', 'Cy']);
	});

	it('clears', () => {
		const bst = sample();
		bst.clear();
		expect(bst.size).toBe(0);
		expect(bst.root).toBeNull();
	});
});
