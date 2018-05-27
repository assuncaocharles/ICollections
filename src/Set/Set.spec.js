

import { Set } from './Set';

describe("Set", function () {
    it("Should init a new set", function () {
        const set = new Set();
        expect(set).not.toBeNull();
        expect(set.size).toBe(0);
    });

    it("Should add itens to a new set", function () {
        var set = new Set();
        set.add("a");
        set.add("b");
        expect(set.size).toBe(2);
        expect(set.has("a")).toBe(true);
        expect(set.has("b")).toBe(true);
        expect(set.values).toEqual(["a", "b"]);
    });

    it("Should remove a specific item from a set", function () {
        var set = new Set();
        set.add("a");
        set.remove("a");
        expect(set.size).toBe(0);
        expect(set.has("a")).toBe(false);
    });

    it("Should return a new set with the intersection of two others set", function () {
        var setA = new Set();
        var setB = new Set();
        setA.add("a");
        setA.add("b");
        setA.add("c");
        setB.add("a");
        setB.add("c");
        setB.add("z");
        
        var intersectSet = setA.intersection(setB);

        expect(intersectSet.size).toBe(2);
        expect(intersectSet.values).toEqual(["a", "c"]);
    });

    it("Should return a new set with the diference of two others set", function () {
        var setA = new Set();
        var setB = new Set();
        setA.add("a");
        setA.add("b");
        setA.add("c");
        setB.add("a");
        setB.add("c");
        setB.add("z");
        
        var diffSet = setA.difference(setB);

        expect(diffSet.size).toBe(1);
        expect(diffSet.values).toEqual(["b"]);
    });

    it("Should determine if a set is a subset of another set", function () {
        var setA = new Set();
        var setB = new Set();
        
        setA.add("a");
        setA.add("b");
        setA.add("c");
        setA.add("d");

        setB.add("a");
        setB.add("b");
        
        expect(setB.subset(setA)).toBe(true);
        
    });

});