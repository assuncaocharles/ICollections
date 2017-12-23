

import { Map } from './Maps';

describe("Maps", function () {
    
    it("Should init a new Map", function () {
        var map = new Map();
        expect(map).not.toBeNull();
        expect(map.size).toBe(0);
    });

    it("Should set new itens", function () {
        let map = new Map();
        map.set('arms', 2);
        map.set('fingers', 10);
        map.set('eyes', 2);
        map.set('belley button', 1);
        expect(map.size).toBe(4);
    });

    it("Should set new itens with object key", function () {
        let map = new Map();
        let obj = {name: 'languange'};
        map.set(obj, 'JavaScript');

        expect(map.has(obj)).toBe(true);
        expect(map.has({name: 'languange'})).toBe(true);
        expect(map.get(obj)).toBe('JavaScript');
    });

    it("Should get a especific value", function () {
        let map = new Map();
        map.set('arms', 2);
        map.set('fingers', 10);
        map.set('eyes', 2);
        map.set('belley button', 1);
        expect(map.has('arms')).toBe(true);
        expect(map.get('arms')).toBe(2);
    });

    it("Should get all values", function () {
        let map = new Map();
        map.set('arms', 2);
        map.set('fingers', 10);
        map.set('eyes', 2);
        map.set('belley button', 1);
        expect(map.values).toEqual([2,10,2,1]);
    });


    it("Should clean the map", function () {
        let map = new Map();
        map.set('arms', 2);
        map.set('fingers', 10);
        map.set('eyes', 2);
        map.set('belley button', 1);
        expect(map.size).toBe(4)
        map.clear();
        expect(map.size).toBe(0);
    });

    it("Should delete a specific value", function () {
        let map = new Map();
        map.set('arms', 2);
        map.set('fingers', 10);
        map.set('eyes', 2);
        map.set('belley button', 1);
        expect(map.has('eyes')).toBe(true)
        map.delete('eyes');
        expect(map.has('eyes')).toBe(false);
    });

});