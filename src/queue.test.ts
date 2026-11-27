import { describe, expect, it } from 'vitest';
import { Queue } from './queue.js';

describe('Queue', () => {
	it('starts empty', () => {
		const queue = new Queue<string>();
		expect(queue.size).toBe(0);
		expect(queue.isEmpty).toBe(true);
		expect(queue.front).toBeUndefined();
		expect(queue.dequeue()).toBeUndefined();
	});

	it('enqueues', () => {
		const queue = new Queue<string>();
		queue.enqueue('a');
		expect(queue.enqueue('b', 'c')).toBe(3);
		expect(queue.isEmpty).toBe(false);
		expect(queue.size).toBe(3);
		expect(queue.front).toBe('a');
	});

	it('dequeues in FIFO order', () => {
		const queue = new Queue(['a', 'b', 'c']);
		expect(queue.dequeue()).toBe('a');
		expect(queue.size).toBe(2);
		expect(queue.front).toBe('b');
	});

	it('stays correct across many interleaved operations', () => {
		const queue = new Queue<number>();
		const expected: number[] = [];
		for (let i = 0; i < 1000; i++) {
			queue.enqueue(i);
			expected.push(i);
			if (i % 3 === 0) expect(queue.dequeue()).toBe(expected.shift());
		}
		expect(queue.size).toBe(expected.length);
		expect(queue.toArray()).toEqual(expected);
		expect([...queue]).toEqual(expected);
		while (!queue.isEmpty) expect(queue.dequeue()).toBe(expected.shift());
		expect(expected).toEqual([]);
	});

	it('clears', () => {
		const queue = new Queue([1, 2, 3]);
		queue.dequeue();
		queue.clear();
		expect(queue.size).toBe(0);
		expect(queue.front).toBeUndefined();
		queue.enqueue(4);
		expect(queue.toArray()).toEqual([4]);
	});
});
