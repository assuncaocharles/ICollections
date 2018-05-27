export class Set{


    constructor(){
        // the var collection will hold the set
        this.collection = [];
    }

    // this method will check for the presence of an element and return true or false
    has(element) {
        return (this.collection.indexOf(element) !== -1);
    }

    // this method will return all the values in the set
    get values() {
        return this.collection;
    }

    // this method will add an element to the set
    add(element) {
        if (!this.has(element)) {
            this.collection.push(element);
            return true;
        }
        return false;
    }

    // this method will remove an element from a set
    remove(element) {
        if (this.has(element)) {
            let index = this.collection.indexOf(element);
            this.collection.splice(index, 1);
            return true;
        }
        return false;
    }

    // this method will return the size of the collection
    get size() {
        return this.collection.length;
    }

    // this method will return the union of two sets
    union(otherSet) {
        var unionSet = new Set();
        var firstSet = this.values;
        var secondSet = otherSet.values;
        firstSet.forEach(function (e) {
            unionSet.add(e);
        });
        secondSet.forEach(function (e) {
            unionSet.add(e);
        });
        return unionSet;
    }

    // this method will return the intersection of two sets as a new set
    intersection(otherSet) {
        var intersectionSet = new Set();
        var firstSet = this.values;
        firstSet.forEach(function (e) {
            if (otherSet.has(e)) {
                intersectionSet.add(e);
            }
        });
        return intersectionSet;
    }

    // this method will return the difference of two sets as a new set
    difference(otherSet) {
        var differenceSet = new Set();
        var firstSet = this.values;
        firstSet.forEach(function (e) {
            if (!otherSet.has(e)) {
                differenceSet.add(e);
            }
        });
        return differenceSet;
    }

    // this method will test if the set is a subset of a different set
    subset(otherSet) {
        var firstSet = this.values;
        return firstSet.every(function (value) {
            return otherSet.has(value);
        });
    }
}