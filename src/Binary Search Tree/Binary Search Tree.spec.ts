import { BST } from './Binary Search Tree';

describe('Binary Search Tree', function() {
	let bst: BST<number>;

	beforeEach(() => {
		bst = new BST<number>();
	});

	it('Should init a new BST', function() {
		expect(bst).toBeDefined();
	});

	it('Should add new nodes', function() {
		bst.add(10);
		bst.add(5);
		expect(bst.isPresent(5)).toBe(true);
		expect(bst.isPresent(10)).toBe(true);
	});

	it('Should remove a node', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.remove(10);
		expect(bst.isPresent(10)).toBe(false);
	});

	it('Should find the min value', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		expect(bst.findMin()).toBe(2);
	});

	it('Should find the max value', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		console.log(bst);
		expect(bst.findMax()).toBe(133);
	});

	it('Should determine if is balanced', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		expect(bst.isBalanced()).toBe(true);
	});

	it('Should return data in order', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		bst.add(12);
		expect(bst.inOrder()).toEqual([2, 5, 10, 12, 13, 42, 133]);
	});

	it('Should return data in pre order', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		bst.add(12);
		expect(bst.preOrder()).toEqual([10, 5, 2, 13, 12, 133, 42]);
	});

	it('Should return data in post order', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		bst.add(12);
		expect(bst.postOrder()).toEqual([2, 5, 12, 42, 133, 13, 10]);
	});

	it('Should return data by layer', function() {
		bst.add(10);
		bst.add(5);
		bst.add(13);
		bst.add(2);
		bst.add(133);
		bst.add(42);
		bst.add(12);
		expect(bst.layers()).toEqual([10, 5, 13, 2, 12, 133, 42]);
	});

	it('Should invert the tree', () => {
		bst.add(10);
		bst.add(15);
		bst.add(5);
		bst.add(4);
		bst.add(6);

		bst.invert();

		expect(bst.preOrder()).toEqual([10, 15, 5, 6, 4]);
	});

	it('Should find the height of a element', () => {
		bst.add(10);
		bst.add(15);
		bst.add(20);
		bst.add(21);
		bst.add(22);
		bst.add(23);
		bst.add(5);
		bst.add(3);
		bst.add(1);

		expect(bst.elementHeight(1)).toBe(0);
		expect(bst.elementHeight(3)).toBe(1);
		expect(bst.elementHeight(10)).toBe(5);
	});

	it('Should return -1 if the element does not exist', () => {
		bst.add(10);
		bst.add(15);
		bst.add(5);
		bst.add(3);
		bst.add(1);

		expect(bst.elementHeight(1001)).toBe(-1);
		expect(bst.elementHeight(3123)).toBe(-1);
		expect(bst.elementHeight(1110)).toBe(-1);
	});

	it('Should find the element depth', () => {
		bst.add(10);
		bst.add(15);
		bst.add(5);
		bst.add(3);
		bst.add(1);

		expect(bst.elementDepth(10)).toBe(0);
		expect(bst.elementDepth(15)).toBe(1);
		expect(bst.elementDepth(1)).toBe(3);
	});

	it('Should return -1 when the element does not exist', () => {
		bst.add(10);
		bst.add(15);
		bst.add(5);
		bst.add(3);
		bst.add(1);

		expect(bst.elementDepth(10123)).toBe(-1);
		expect(bst.elementDepth(11235)).toBe(-1);
		expect(bst.elementDepth(11)).toBe(-1);
	});
});
