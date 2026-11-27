import { describe, expect, it } from 'vitest';
import { LinkedList } from './linked-list.js';

describe('LinkedList', () => {
	it('starts empty', () => {
		const list = new LinkedList<number>();
		expect(list.size).toBe(0);
		expect(list.isEmpty).toBe(true);
		expect(list.head).toBeNull();
		expect(list.tail).toBeNull();
		expect(list.indexOf(1)).toBe(-1);
		expect(list.dataAt(0)).toBeUndefined();
	});

	it('adds nodes', () => {
		const list = new LinkedList<number>();
		list.add(10).add(5).add(3);
		expect(list.size).toBe(3);
		expect(list.head?.data).toBe(10);
		expect(list.tail?.data).toBe(3);
		expect(list.toArray()).toEqual([10, 5, 3]);
	});

	it('adds nodes at an index', () => {
		const list = new LinkedList([10, 5, 3]);
		list.addAt(1, 7);
		expect(list.dataAt(1)).toBe(7);
		expect(list.indexOf(7)).toBe(1);
		list.addAt(0, 1);
		list.addAt(list.size, 99);
		expect(list.toArray()).toEqual([1, 10, 7, 5, 3, 99]);
		expect(list.tail?.data).toBe(99);
		list.add(100);
		expect(list.toArray().at(-1)).toBe(100);
	});

	it('rejects out-of-range insertion', () => {
		const list = new LinkedList([1]);
		expect(() => list.addAt(-1, 0)).toThrow(RangeError);
		expect(() => list.addAt(2, 0)).toThrow(RangeError);
		expect(() => list.addAt(0.5, 0)).toThrow(RangeError);
	});

	it('removes a value', () => {
		const list = new LinkedList([10, 5, 3]);
		expect(list.remove(3)).toBe(true);
		expect(list.dataAt(2)).toBeUndefined();
		expect(list.indexOf(3)).toBe(-1);
		expect(list.tail?.data).toBe(5);
		list.add(4);
		expect(list.toArray()).toEqual([10, 5, 4]);
	});

	it('does not remove anything when the value is missing', () => {
		const list = new LinkedList([10, 5, 3]);
		expect(list.remove(42)).toBe(false);
		expect(list.toArray()).toEqual([10, 5, 3]);
		expect(list.size).toBe(3);
		expect(new LinkedList<number>().remove(1)).toBe(false);
	});

	it('removes the head and the only element', () => {
		const list = new LinkedList([1, 2]);
		expect(list.remove(1)).toBe(true);
		expect(list.head?.data).toBe(2);
		expect(list.remove(2)).toBe(true);
		expect(list.head).toBeNull();
		expect(list.tail).toBeNull();
		list.add(3);
		expect(list.toArray()).toEqual([3]);
	});

	it('removes at an index', () => {
		const list = new LinkedList([10, 5, 3]);
		expect(list.removeAt(1)).toBe(5);
		expect(list.dataAt(1)).toBe(3);
		expect(list.indexOf(5)).toBe(-1);
		expect(list.removeAt(1)).toBe(3);
		expect(list.tail?.data).toBe(10);
		expect(list.removeAt(0)).toBe(10);
		expect(list.isEmpty).toBe(true);
		expect(() => list.removeAt(0)).toThrow(RangeError);
	});

	it('compares with SameValueZero', () => {
		const list = new LinkedList([Number.NaN]);
		expect(list.has(Number.NaN)).toBe(true);
		expect(list.indexOf(Number.NaN)).toBe(0);
	});

	it('iterates and clears', () => {
		const list = new LinkedList(['a', 'b']);
		expect([...list]).toEqual(['a', 'b']);
		list.clear();
		expect(list.size).toBe(0);
		expect(list.head).toBeNull();
	});
});
