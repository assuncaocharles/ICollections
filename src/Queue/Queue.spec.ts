

import { Queue } from './Queue';

describe("Queue", function () {

    it("Should init a new Queue", function () {
        const queue = new Queue();
        expect(queue).not.toBeNull();
        expect(queue.size).toBe(0);
    });

    it("Should add new itens to the Queue", function () {
        const queue = new Queue();
        queue.enqueue('a');
        queue.enqueue('b');
        queue.enqueue('c');
        expect(queue.isEmpty).toBe(false);
        expect(queue.size).toBe(3);
        expect(queue.front).toBe('a');
    });

    it("Should dequeue correctly", function () {
        const queue = new Queue();
        queue.enqueue('a');
        queue.enqueue('b');
        queue.enqueue('c');
        expect(queue.dequeue()).toBe('a');
        expect(queue.size).toBe(2);
        expect(queue.front).toBe('b');
    });

});