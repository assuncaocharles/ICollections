import { describe, expect, it } from 'vitest';
import { PriorityQueue } from './priority-queue.js';

describe('PriorityQueue', () => {
	it('starts empty', () => {
		const queue = new PriorityQueue<string>();
		expect(queue.size).toBe(0);
		expect(queue.isEmpty).toBe(true);
		expect(queue.front).toBeUndefined();
		expect(queue.dequeue()).toBeUndefined();
	});

	it('orders by priority, lowest first', () => {
		const queue = new PriorityQueue<string>();
		queue.enqueue(['I am last one', 4]);
		queue.enqueue(['Just the third', 3]);
		queue.enqueue(['Almost', 2]);
		queue.enqueue(['FIRST ONE, WINNER', 1]);
		expect(queue.front).toEqual(['FIRST ONE, WINNER', 1]);
		expect(queue.size).toBe(4);
	});

	it('dequeues', () => {
		const queue = new PriorityQueue([
			['I am last one', 4],
			['Just the third', 3],
			['Almost', 2],
			['FIRST ONE, WINNER', 1],
		]);
		expect(queue.dequeue()).toBe('FIRST ONE, WINNER');
		expect(queue.front).toEqual(['Almost', 2]);
	});

	it('accepts value and priority as separate arguments', () => {
		const queue = new PriorityQueue<string>();
		expect(queue.enqueue('b', 2)).toBe(1);
		expect(queue.enqueue('a', 1)).toBe(2);
		expect(queue.dequeue()).toBe('a');
	});

	it('keeps insertion order for equal priorities', () => {
		const queue = new PriorityQueue<string>();
		for (const value of ['a', 'b', 'c', 'd', 'e']) queue.enqueue(value, 1);
		queue.enqueue('first', 0);
		expect(Array.from({ length: 6 }, () => queue.dequeue())).toEqual(['first', 'a', 'b', 'c', 'd', 'e']);
	});

	it('matches a sorted reference over random input', () => {
		const queue = new PriorityQueue<number>();
		const reference: [number, number][] = [];
		for (let i = 0; i < 500; i++) {
			const priority = Math.floor(Math.random() * 50);
			queue.enqueue(i, priority);
			reference.push([i, priority]);
		}
		// Array#sort is stable, so this is the expected order including ties.
		reference.sort((a, b) => a[1] - b[1]);
		expect(queue.toArray()).toEqual(reference);
		expect([...queue]).toEqual(reference);
		expect(Array.from({ length: 500 }, () => queue.dequeue())).toEqual(reference.map(([value]) => value));
	});

	it('rejects NaN priorities', () => {
		expect(() => new PriorityQueue<string>().enqueue('x', Number.NaN)).toThrow(RangeError);
	});

	it('clears', () => {
		const queue = new PriorityQueue<string>([['a', 1]]);
		queue.clear();
		expect(queue.isEmpty).toBe(true);
	});
});
