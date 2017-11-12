LinkedList = require("./LinkedList");

describe("Linked List", function () {
    it("Should init a new linked list", function () {
        let list = new LinkedList();
        expect(list).not.toBeNull();
        expect(list.length).toBe(0);
    });

    it("Should add new nodes", function () {
        var linked = new LinkedList();
        linked.add(10);
        linked.add(5);
        linked.add(3);
        expect(linked.length).toBe(3);
    });

    it("Should add new node in a specific index", function () {
        var linked = new LinkedList();
        linked.add(10);
        linked.add(5);
        linked.add(3);
        linked.addAt(1,7)
        expect(linked.dataAt(1)).toBe(7);
        expect(linked.indexOf(7)).toBe(1);
    });

    it("Should remove a node", function () {
        var linked = new LinkedList();
        linked.add(10);
        linked.add(5);
        linked.add(3);
        linked.remove(3);
        expect(linked.dataAt(2)).toBe(-1);
        expect(linked.indexOf(3)).toBe(-1);
    });

    it("Should remove a specific node", function () {
        var linked = new LinkedList();
        linked.add(10);
        linked.add(5);
        linked.add(3);
        linked.removeAt(1);
        expect(linked.dataAt(1)).toBe(3);
        expect(linked.indexOf(5)).toBe(-1);
    });
});