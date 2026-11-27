import { describe, expect, it } from 'vitest';
import { HashTable } from './hash-table.js';

describe('HashTable', () => {
	it('is created with a storage limit', () => {
		expect(new HashTable(14).storageLimit).toBe(14);
		expect(new HashTable().storageLimit).toBe(32);
	});

	it('rejects invalid storage limits', () => {
		expect(() => new HashTable(0)).toThrow(RangeError);
		expect(() => new HashTable(1.5)).toThrow(RangeError);
	});

	it('adds and looks up entries', () => {
		const table = new HashTable<string>(1);
		table.add('beau', 'person');
		expect(table.lookup('beau')).toBe('person');
		expect(table.has('beau')).toBe(true);
		expect(table.lookup('missing')).toBeUndefined();
		expect(table.size).toBe(1);
	});

	it('replaces values for existing keys', () => {
		const table = new HashTable<number>();
		table.add('a', 1).add('a', 2);
		expect(table.lookup('a')).toBe(2);
		expect(table.size).toBe(1);
	});

	it('removes entries', () => {
		const table = new HashTable<string>(1);
		table.add('beau', 'person');
		expect(table.remove('beau')).toBe(true);
		expect(table.lookup('beau')).toBeUndefined();
		expect(table.isEmpty).toBe(true);
	});

	it('handles removal of missing keys', () => {
		const table = new HashTable<number>(4);
		expect(table.remove('nothing here')).toBe(false);
		table.add('a', 1);
		expect(table.remove('b')).toBe(false);
	});

	it('keeps other entries in a shared bucket intact', () => {
		// One bucket forces every key to collide.
		const table = new HashTable<number>(1);
		table.add('a', 1).add('b', 2).add('c', 3);
		expect(table.remove('b')).toBe(true);
		expect(table.lookup('a')).toBe(1);
		expect(table.lookup('c')).toBe(3);
		expect(table.lookup('b')).toBeUndefined();
		expect(table.size).toBe(2);
	});

	it('hashes into range', () => {
		const table = new HashTable(7);
		for (const key of ['', 'a', 'hello', '🙂', 'x'.repeat(1000)]) {
			const index = table.hash(key);
			expect(index).toBeGreaterThanOrEqual(0);
			expect(index).toBeLessThan(7);
			expect(table.hash(key)).toBe(index);
		}
		expect(table.hash('a', 3)).toBeLessThan(3);
	});

	it('iterates over entries and clears', () => {
		const table = new HashTable<number>(4);
		table.add('a', 1).add('b', 2).add('c', 3);
		expect(new globalThis.Map(table)).toEqual(
			new globalThis.Map([
				['a', 1],
				['b', 2],
				['c', 3],
			]),
		);
		expect(table.keys().toSorted()).toEqual(['a', 'b', 'c']);
		expect(table.values().toSorted()).toEqual([1, 2, 3]);
		table.clear();
		expect(table.size).toBe(0);
		expect([...table]).toEqual([]);
	});
});
