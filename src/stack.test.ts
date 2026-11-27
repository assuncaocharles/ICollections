import { describe, expect, it } from 'vitest';
import { Stack } from './stack.js';

describe('Stack', () => {
	it('starts empty', () => {
		const stack = new Stack<number>();
		expect(stack.size).toBe(0);
		expect(stack.isEmpty).toBe(true);
		expect(stack.peek).toBeUndefined();
		expect(stack.pop()).toBeUndefined();
	});

	it('pushes and peeks', () => {
		const stack = new Stack<number>();
		expect(stack.push(10)).toBe(1);
		expect(stack.push(5, 7)).toBe(3);
		expect(stack.size).toBe(3);
		expect(stack.peek).toBe(7);
	});

	it('pops in LIFO order', () => {
		const stack = new Stack([10, 5, 7]);
		expect(stack.pop()).toBe(7);
		expect(stack.size).toBe(2);
		expect(stack.peek).toBe(5);
	});

	it('iterates from top to bottom without mutating', () => {
		const stack = new Stack([1, 2, 3]);
		expect([...stack]).toEqual([3, 2, 1]);
		expect(stack.toArray()).toEqual([3, 2, 1]);
		expect(stack.size).toBe(3);
	});

	it('clears', () => {
		const stack = new Stack([1, 2]);
		stack.clear();
		expect(stack.isEmpty).toBe(true);
		expect(stack.peek).toBeUndefined();
	});

	it('keeps falsy values', () => {
		const stack = new Stack<number | undefined>([0, undefined]);
		expect(stack.size).toBe(2);
		expect(stack.pop()).toBeUndefined();
		expect(stack.pop()).toBe(0);
	});
});
