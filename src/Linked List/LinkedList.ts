export class Node<T> {
	next: Node<T>;
	constructor(public data: T) {}
}

export class LinkedList<T> {
	private _head: Node<T> = null;
	private length: number = 0;
	constructor() {}

	get size(): number {
		return this.length;
	}

	get head(): Node<T> {
		return this._head;
	}

	add(data: T): void {
		let node = new Node(data);
		if (this._head == null) {
			this._head = node;
		} else {
			let temp = this._head;

			while (temp.next) {
				temp = temp.next;
			}

			temp.next = node;
		}
		this.length++;
	}

	remove(nodeData: T): void {
		if (!this._head) {
			throw new Error('Empty list');
		} else {
			let temp = this._head;
			let prev;
			if (temp.data == nodeData) {
				this._head = this._head.next;
			} else {
				while (temp.data != nodeData && temp.next != null) {
					prev = temp;
					temp = temp.next;
				}
				prev.next = temp.next;
			}
			this.length--;
		}
	}

	addAt(index: number, data: T): void {
		if (index > this.length || index < 0) {
			throw new Error('Index not fit in aactual list range');
			return;
		}
		var node = new Node(data);
		if (index == 0) {
			node.next = this._head;
			this._head = node;
		} else {
			let count = 0;
			let curr = this._head;
			let prev;
			while (count < index) {
				prev = curr;
				curr = curr.next;
				count++;
			}
			node.next = curr;
			prev.next = node;
		}
		this.length++;
	}

	removeAt(index: number): void {
		if (index >= this.length || index < 0) {
			throw new Error('Index not fit in aactual list range');
			return;
		}
		if (index == 0) {
			this._head = this._head.next;
		} else {
			let curr = this._head;
			let prev;
			let count = 0;
			while (count < index) {
				prev = curr;
				curr = curr.next;
				count++;
			}
			prev.next = curr.next;
		}
		this.length--;
	}

	indexOf(nodeData: T): number {
		let curr = this._head;
		let index = 0;
		while (curr.data != nodeData) {
			if (curr.next) {
				curr = curr.next;
				index++;
			} else {
				return -1;
			}
		}
		return index;
	}

	dataAt(index: number): T | number {
		if (index < 0 || index >= this.length) {
			return -1;
		}
		let count = 0;
		let temp = this._head;
		while (count < index) {
			temp = temp.next;
			count++;
		}
		return temp.data;
	}
}
