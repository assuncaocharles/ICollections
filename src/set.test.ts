import { describe, expect, it } from 'vitest';
import { Set } from './set.js';

describe('Set', () => {
	it('starts empty', () => {
		const set = new Set<string>();
		expect(set.size).toBe(0);
		expect(set.isEmpty).toBe(true);
	});

	it('adds unique values', () => {
		const set = new Set<string>();
		expect(set.add('a')).toBe(true);
		expect(set.add('b')).toBe(true);
		expect(set.add('a')).toBe(false);
		expect(set.size).toBe(2);
		expect(set.has('a')).toBe(true);
		expect(set.has('b')).toBe(true);
		expect(set.values).toEqual(['a', 'b']);
	});

	it('removes values', () => {
		const set = new Set(['a']);
		expect(set.remove('a')).toBe(true);
		expect(set.remove('a')).toBe(false);
		expect(set.size).toBe(0);
		expect(set.has('a')).toBe(false);
	});

	it('does not expose its internal storage', () => {
		const set = new Set(['a']);
		set.values.push('b');
		expect(set.size).toBe(1);
	});

	it('compares with SameValueZero', () => {
		const set = new Set([Number.NaN, 0]);
		expect(set.has(Number.NaN)).toBe(true);
		expect(set.has(-0)).toBe(true);
	});

	const setA = (): Set<string> => new Set(['a', 'b', 'c']);
	const setB = (): Set<string> => new Set(['a', 'c', 'z']);

	it('computes the union', () => {
		const union = setA().union(setB());
		expect(union.values).toEqual(['a', 'b', 'c', 'z']);
		expect(new Set([1]).union(['x']).values).toEqual([1, 'x']);
	});

	it('computes the intersection', () => {
		const intersection = setA().intersection(setB());
		expect(intersection.size).toBe(2);
		expect(intersection.values).toEqual(['a', 'c']);
	});

	it('computes the difference', () => {
		const difference = setA().difference(setB());
		expect(difference.size).toBe(1);
		expect(difference.values).toEqual(['b']);
	});

	it('checks subsets', () => {
		const superset = new Set(['a', 'b', 'c', 'd']);
		expect(new Set(['a', 'b']).subset(superset)).toBe(true);
		expect(new Set(['a', 'x']).subset(superset)).toBe(false);
		expect(new Set<string>().subset(superset)).toBe(true);
	});

	it('compares objects by reference', () => {
		const set = new Set<object>([{ a: 1 }]);
		expect(set.has({ a: 1 })).toBe(false);
		expect(set.add({ a: 1 })).toBe(true);
	});

	it('works with built-in sets', () => {
		expect(setA().intersection(new globalThis.Set(['b'])).values).toEqual(['b']);
	});

	it('iterates and clears', () => {
		const set = setA();
		expect([...set]).toEqual(['a', 'b', 'c']);
		expect(set.toArray()).toEqual(['a', 'b', 'c']);
		set.clear();
		expect(set.isEmpty).toBe(true);
	});
});
