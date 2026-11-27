import { describe, expect, it } from 'vitest';
import { Map } from './map.js';

const bodyParts = (): Map<string, number> =>
	new Map([
		['arms', 2],
		['fingers', 10],
		['eyes', 2],
		['belly button', 1],
	]);

describe('Map', () => {
	it('starts empty', () => {
		const map = new Map<string, number>();
		expect(map.size).toBe(0);
		expect(map.isEmpty).toBe(true);
		expect(map.values).toEqual([]);
	});

	it('sets entries', () => {
		const map = new Map<string, number>();
		map.set('arms', 2).set('fingers', 10).set('eyes', 2).set('belly button', 1);
		expect(map.size).toBe(4);
	});

	it('does not count overwrites as new entries', () => {
		const map = new Map<string, number>();
		map.set('a', 1).set('a', 2);
		expect(map.size).toBe(1);
		expect(map.get('a')).toBe(2);
	});

	it('uses object keys by reference', () => {
		const map = new Map<object, string>();
		const obj = { name: 'language' };
		map.set(obj, 'JavaScript');
		expect(map.has(obj)).toBe(true);
		expect(map.get(obj)).toBe('JavaScript');
		expect(map.has({ name: 'language' })).toBe(false);
		map.set({ name: 'other' }, 'TypeScript');
		expect(map.size).toBe(2);
	});

	it('gets values', () => {
		const map = bodyParts();
		expect(map.has('arms')).toBe(true);
		expect(map.get('arms')).toBe(2);
		expect(map.get('tail')).toBeUndefined();
	});

	it('lists keys, values and entries', () => {
		const map = bodyParts();
		expect(map.keys).toEqual(['arms', 'fingers', 'eyes', 'belly button']);
		expect(map.values).toEqual([2, 10, 2, 1]);
		expect(map.entries[0]).toEqual(['arms', 2]);
		expect([...map]).toEqual(map.entries);
	});

	it('clears', () => {
		const map = bodyParts();
		map.clear();
		expect(map.size).toBe(0);
	});

	it('deletes entries', () => {
		const map = bodyParts();
		expect(map.delete('eyes')).toBe(true);
		expect(map.delete('eyes')).toBe(false);
		expect(map.has('eyes')).toBe(false);
		expect(map.size).toBe(3);
	});
});
