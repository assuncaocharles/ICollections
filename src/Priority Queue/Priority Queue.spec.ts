import { PriorityQueue } from './Priority Queue';

describe('Priority Queue', function() {
	it('Should init a new Priority Queue', function() {
		const queue = new PriorityQueue();
		expect(queue).not.toBeNull();
		expect(queue.size).toBe(0);
	});

	it('Should add itens in the right order', function() {
		const queue = new PriorityQueue();
		queue.enqueue(['I am last one', 4]);
		queue.enqueue(['Just the third', 3]);
		queue.enqueue(['Almost', 2]);
		queue.enqueue(['FIRST ONE, WINNER', 1]);
		expect(queue.front).toEqual(['FIRST ONE, WINNER', 1]);
	});

	it('Should dequeu correctly', function() {
		const queue = new PriorityQueue();
		queue.enqueue(['I am last one', 4]);
		queue.enqueue(['Just the third', 3]);
		queue.enqueue(['Almost', 2]);
		queue.enqueue(['FIRST ONE, WINNER', 1]);
		queue.dequeue();
		expect(queue.front).toEqual(['Almost', 2]);
	});
});
