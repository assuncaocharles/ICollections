export class Node<T> {
	constructor(public data: T, public left: Node<T> = null, public right: Node<T> = null) {
		this.data = data;
		this.left = left;
		this.right = right;
	}
}

export class BST<T> {
	constructor(private root: Node<T> = null) {}
	add(data: T): void {
		if (this.root === null) {
			this.root = new Node(data);
			return;
		} else {
			const searchTree = (node: Node<T>): any => {
				if (data < node.data) {
					if (node.left === null) {
						node.left = new Node(data);
						return;
					} else if (node.left !== null) {
						return searchTree(node.left);
					}
				} else if (data > node.data) {
					if (node.right === null) {
						node.right = new Node(data);
						return;
					} else if (node.right !== null) {
						return searchTree(node.right);
					}
				} else {
					return null;
				}
			};
			return searchTree(this.root);
		}
	}

	findMin(): T {
		let current: Node<T> = this.root;
		while (current.left !== null) {
			current = current.left;
		}
		return current.data;
	}

	findMax(): T {
		let current = this.root;
		while (current.right !== null) {
			current = current.right;
		}
		return current.data;
	}

	find(data: T): Node<T> {
		let current: Node<T> = this.root;
		while (current.data !== data) {
			if (data < current.data) {
				current = current.left;
			} else {
				current = current.right;
			}
			if (current === null) {
				return null;
			}
		}
		return current;
	}

	isPresent(data: T): boolean {
		let current = this.root;
		while (current) {
			if (data === current.data) {
				return true;
			}
			if (data < current.data) {
				current = current.left;
			} else {
				current = current.right;
			}
		}
		return false;
	}

	remove(data: T): void {
		const removeNode = (node: Node<T>, data: T) => {
			if (node == null) {
				return null;
			}
			if (data == node.data) {
				// node has no children
				if (node.left == null && node.right == null) {
					return null;
				}
				// node has no left child
				if (node.left == null) {
					return node.right;
				}
				// node has no right child
				if (node.right == null) {
					return node.left;
				}
				// node has two children
				var tempNode = node.right;
				while (tempNode.left !== null) {
					tempNode = tempNode.left;
				}
				node.data = tempNode.data;
				node.right = removeNode(node.right, tempNode.data);
				return node;
			} else if (data < node.data) {
				node.left = removeNode(node.left, data);
				return node;
			} else {
				node.right = removeNode(node.right, data);
				return node;
			}
		};
		this.root = removeNode(this.root, data);
	}

	isBalanced(): boolean {
		return this.findMinHeight() >= this.findMaxHeight() - 1;
	}

	findMinHeight(node: Node<T> = this.root): number {
		if (node == null) {
			return -1;
		}
		let left = this.findMinHeight(node.left);
		let right = this.findMinHeight(node.right);
		if (left < right) {
			return left + 1;
		} else {
			return right + 1;
		}
	}

	findMaxHeight(node: Node<T> = this.root): number {
		if (node == null) {
			return -1;
		}
		let left = this.findMaxHeight(node.left);
		let right = this.findMaxHeight(node.right);
		if (left > right) {
			return left + 1;
		} else {
			return right + 1;
		}
	}

	inOrder(): Array<T> {
		if (this.root == null) {
			return null;
		} else {
			var result = new Array();
			const traverseInOrder = (node: Node<T>): any => {
				node.left && traverseInOrder(node.left);
				result.push(node.data);
				node.right && traverseInOrder(node.right);
			};
			traverseInOrder(this.root);
			return result;
		}
	}

	preOrder(): Array<T> {
		if (this.root == null) {
			return null;
		} else {
			var result = new Array();
			const traversePreOrder = (node: Node<T>): any => {
				result.push(node.data);
				node.left && traversePreOrder(node.left);
				node.right && traversePreOrder(node.right);
			};
			traversePreOrder(this.root);
			return result;
		}
	}

	postOrder(): Array<T> {
		if (this.root == null) {
			return null;
		} else {
			var result = new Array();
			const traversePostOrder = (node: Node<T>): any => {
				node.left && traversePostOrder(node.left);
				node.right && traversePostOrder(node.right);
				result.push(node.data);
			};
			traversePostOrder(this.root);
			return result;
		}
	}

	levelOrder(): Array<T> {
		let result = [];
		let Q = [];
		if (this.root != null) {
			Q.push(this.root);
			while (Q.length > 0) {
				let node = Q.shift();
				result.push(node.data);
				if (node.left != null) {
					Q.push(node.left);
				}
				if (node.right != null) {
					Q.push(node.right);
				}
			}
			return result;
		} else {
			return null;
		}
	}

	layers(): Array<T> {
		if (this.root == null) {
			return null;
		} else {
			var result = new Array();
			let queue = [];
			queue.push(this.root);
			while (queue.length > 0) {
				result.push(queue[0].data);

				if (queue[0].left !== null) {
					queue.push(queue[0].left);
				}
				if (queue[0].right !== null) {
					queue.push(queue[0].right);
				}
				queue.splice(0, 1);
			}
			return result;
		}
	}

	invert(): void {
		function invert(node: Node<T>) {
			if (!node.left && !node.right) {
				return;
			}
			invert(node.left);
			invert(node.right);

			const tempNode = node.right;
			node.right = node.left;
			node.left = tempNode;
		}
		invert(this.root);
	}
}
