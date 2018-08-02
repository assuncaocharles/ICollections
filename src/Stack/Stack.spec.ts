import { Stack } from './Stack';

describe('Stack', function() {
	it('Should init a new stack', function() {
		let stack = new Stack();
		expect(stack).not.toBeNull();
		expect(stack.size).toBe(0);
	});

	it('Should push data', function() {
		let stack = new Stack();
		stack.push(10);
		stack.push(5);
		stack.push(7);
		expect(stack.size).toBe(3);
		expect(stack.peek).toBe(7);
	});

	it('Should pop data', function() {
		let stack = new Stack();
		stack.push(10);
		stack.push(5);
		stack.push(7);
		expect(stack.size).toBe(3);
		expect(stack.peek).toBe(7);
		stack.pop();
		expect(stack.size).toBe(2);
		expect(stack.peek).toBe(5);
	});
});
