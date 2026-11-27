import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error The site build scripts are plain JavaScript.
import { parseDeclarations } from './api.mjs';

const source = `/**
 * Min-priority queue.
 *
 * Lower numbers first.
 */
export declare class PriorityQueue<T> implements Iterable<PriorityEntry<T>> {
    #private;
    /** Creates a queue. */
    constructor(entries?: Iterable<PriorityEntry<T>>);
    get size(): number;
    /** Adds an element and returns the new size. */
    enqueue(entry: PriorityEntry<T>): number;
    enqueue(value: T, priority: number): number;
    /**
     * Removes at an index.
     *
     * @throws {RangeError} If out of range.
     */
    removeAt(index: number): T;
    /** @deprecated Alias of {@link X.y}. */
    layers(): T[];
}
//# sourceMappingURL=x.d.ts.map`;

describe('parseDeclarations', () => {
	const [queue] = parseDeclarations(source);

	it('reads the class and its description', () => {
		expect(queue.name).toBe('PriorityQueue');
		expect(queue.signature).toBe('class PriorityQueue<T> implements Iterable<PriorityEntry<T>>');
		expect(queue.doc).toBe('Min-priority queue.\n\nLower numbers first.');
	});

	it('lists members, skipping private fields', () => {
		expect(queue.members.map((m: { signature: string }) => m.signature.split('\n')[0])).toEqual([
			'constructor(entries?: Iterable<PriorityEntry<T>>)',
			'get size(): number',
			'enqueue(entry: PriorityEntry<T>): number',
			'removeAt(index: number): T',
			'layers(): T[]',
		]);
	});

	it('groups overloads and reads tags', () => {
		const [, , enqueue, removeAt, layers] = queue.members;
		expect(enqueue.signature).toBe(
			'enqueue(entry: PriorityEntry<T>): number\nenqueue(value: T, priority: number): number',
		);
		expect(removeAt.doc).toBe('Removes at an index.');
		expect(removeAt.tags).toEqual([{ name: 'throws', text: '{RangeError} If out of range.' }]);
		expect(layers.doc).toBe('');
		expect(layers.tags).toEqual([{ name: 'deprecated', text: 'Alias of {@link X.y}.' }]);
	});

	it('documents every public member of the built package', () => {
		if (!fs.existsSync('dist/index.d.ts')) return; // runs after `npm run build`
		for (const file of fs.readdirSync('dist').filter((f) => f.endsWith('.d.ts'))) {
			for (const cls of parseDeclarations(fs.readFileSync(`dist/${file}`, 'utf8'))) {
				expect(cls.doc, cls.name).not.toBe('');
				for (const member of cls.members) {
					if (cls.name.endsWith('Node')) continue;
					const documented = member.doc !== '' || member.tags.length > 0;
					expect(documented, `${cls.name}: ${member.signature}`).toBe(true);
				}
			}
		}
	});
});
