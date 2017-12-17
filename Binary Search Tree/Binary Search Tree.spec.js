import { BST } from './Binary Search Tree';

describe("Binary Search Tree", function () {

    it("Should init a new BST", function () {
        let bst = new BST();
        expect(bst).toBeDefined();
    });

    it("Should add new nodes", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5);
        expect(bst.isPresent(5)).toBe(true);
        expect(bst.isPresent(10)).toBe(true);
    });

    it("Should remove a node", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        bst.add(2); 
        bst.remove(10);
        expect(bst.isPresent(10)).toBe(false);
    });

    it("Should find the min value", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        bst.add(2); 
        bst.add(133);
        bst.add(42);
        expect(bst.findMin()).toBe(2);
    });

    it("Should find the max value", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        bst.add(2); 
        bst.add(133);
        bst.add(42);
        expect(bst.findMax()).toBe(133);
    });

    it("Should determine if is balanced", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        bst.add(2); 
        expect(bst.isBalanced()).toBe(true);
    });

    it("Should return data in order", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        bst.add(2); 
        expect(bst.inOrder()).toEqual([2,5,10,13]);
    });

    it("Should return data in pre order", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        expect(bst.preOrder()).toEqual([10, 5, 13]);
    });

    it("Should return data in post order", function () {
        let bst = new BST();
        bst.add(10);
        bst.add(5); 
        bst.add(13);
        expect(bst.postOrder()).toEqual([5, 13, 10]);
    });
    
})