import { Trie } from './Trie';

describe("Trie", function () {

    it("Should init a new trie", function () {
        let trie = new Trie();
        expect(trie).not.toBeNull();
    });

    it("Should add new words", function () {
        let trie = new Trie();
        trie.add('ball');
        trie.add('bat');
        trie.add('doll');
        trie.add('dork');
        trie.add('do');
        trie.add('dorm')
        trie.add('send')
        trie.add('sense')
        expect(trie.print()).toEqual(['ball', 'bat', 'doll', 'dork', 'dorm', 'do', 'send', 'sense']);
    });

    it("Should identify correctly a word", function () {
        let trie = new Trie();
        trie.add('ball');
        trie.add('bat');
        trie.add('doll');
        trie.add('dork');
        
        expect(trie.isWord('bat')).toBe(true);
        expect(trie.isWord('dol')).toBe(false);
    });


});