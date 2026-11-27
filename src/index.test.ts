import { expect, it } from 'vitest';
import * as icollections from './index.js';

it('exposes the public API', () => {
	expect(Object.keys(icollections).toSorted()).toEqual([
		'BST',
		'BSTNode',
		'HashTable',
		'LinkedList',
		'LinkedListNode',
		'Map',
		'PriorityQueue',
		'Queue',
		'Set',
		'Stack',
		'defaultCompare',
	]);
});
