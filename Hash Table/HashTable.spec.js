import { HashTable } from './HashTable';

describe("Hash Table", function () {
    
    it("Should init a new hash table", function () {
        let hashTable = new HashTable();
        expect(hashTable).not.toBeNull();
        expect(hashTable.storageLimit).toBe(14);
    });

    it("Should add new key / value pair", function () {
        var hashTable = new HashTable();
        hashTable.add('beau', 'person');
        expect(hashTable.lookup('beau')).toBe('person');
    });

    it("Should remove key / value pair", function () {
        var hashTable = new HashTable();
        hashTable.add('beau', 'person');
        hashTable.remove('beau');
        expect(hashTable.lookup('beau')).not.toBe('person');
    });

});