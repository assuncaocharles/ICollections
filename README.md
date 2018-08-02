![Data Structures](https://raw.githubusercontent.com/assuncaocharles/javascript_DataStructure/master/logo.png 'Data Structures')

# ICollections


[![BCH compliance](https://bettercodehub.com/edge/badge/assuncaocharles/ICollections?branch=master)](https://bettercodehub.com/) [![Build Status](https://travis-ci.com/assuncaocharles/ICollections.svg?branch=master)](https://travis-ci.com/assuncaocharles/ICollections) [![codecov](https://codecov.io/gh/assuncaocharles/icollections/branch/master/graph/badge.svg)](https://codecov.io/gh/assuncaocharles/icollections) [![Greenkeeper badge](https://badges.greenkeeper.io/assuncaocharles/ICollections.svg)](https://greenkeeper.io/)

> “Bad programmers worry about the code. Good programmers worry about data structures and their relationships.” — Linus Torvalds

This project has javascript implementation for some comum data structures like:

-   Linked List
-   Queue
-   Priority Queue
-   Stack
-   Maps
-   Hash Table
-   Binary Search Tree
-   Set

## Install

```
$ npm i icollections
```

## Usage

### Binary Search Tree

```javascript
import { BST } from 'icollections';

var bst = new BST();
console.log(hashTable.storageLimit); // 14

bst.add(10);
bst.add(5);
console.log(bst.isPresent(5)); // true
console.log(bst.isPresent(10)); // true
console.log(bst.isBalanced()); // false
```

Your actual tree state:

```
    10
   /
  5
```

```javascript
bst.add(13);
```

Your actual tree state:

```
      10
     /  \
    5    13
```

```javascript
console.log(bst.isBalanced()); // true

bst.add(2);
bst.add(133);
bst.add(42);
bst.add(12);
```

Your actual tree state:

```
      10
     /  \
    5    13
   /	/  \
  2    12    133
            /
           42
```

```javascript
console.log(bst.findMin()); // 2
console.log(bst.findMax()); // 133
console.log(bst.inOrder()); //[2,5,10,12,13,42,133]
console.log(bst.preOrder()); //[10,5,2,13,12,133,42]
console.log(bst.postOrder()); //[2,5,12,42,133,13,10]
console.log(bst.layers()); //[10, 5, 13, 2, 12, 133, 42]
```

| Algorithm | Average  | Worst Case |
| --------- | :------: | :--------: |
| Space     |   O(n)   |    O(n)    |
| Search    | O(log n) |    O(n)    |
| Insert    | O(log n) |    O(n)    |
| Delete    | O(log n) |    O(n)    |

### Linked Lists

```javascript
import { LinkedList } from 'icollections';

var linked = new LinkedList();
console.log(linked.size); // 0

linked.add(10);
linked.add(5);
linked.add(3);
console.log(linked.size); // 3

linked.addAt(1, 7);
console.log(linked.dataAt(1)); // 7
console.log(linked.indexOf(7)); // 1

linked.remove(3);

console.log(linked.dataAt(2)); // -1
console.log(linked.indexOf(3)); // -1

linked.add(3);
linked.removeAt(1);
console.log(linked.dataAt(1)); // 3
console.log(linked.indexOf(5)); // -1
```

| Algorithm | Average | Worst Case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(n)   |    O(n)    |
| Insert    |  O(1)   |    O(1)    |
| Delete    |  O(1)   |    O(1)    |

### Stack

```javascript
import { Stack } from 'icollections';

let stack = new Stack();
console.log(stack.size); // 0

stack.push(10);
stack.push(5);
stack.push(7);
console.log(stack.size); // 3
console.log(stack.peek); // 7

stack.pop();
console.log(stack.size); // 2
console.log(stack.peek); // 5
```

| Algorithm | Average | Worst Case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(n)   |    O(n)    |
| Insert    |  O(1)   |    O(1)    |
| Delete    |  O(1)   |    O(1)    |

### Queue

```javascript
import { Queue } from 'icollections';

const queue = new Queue();
console.log(queue.size); // 0

queue.enqueue('a');
queue.enqueue('b');
queue.enqueue('c');

console.log(queue.isEmpty); // false
console.log(queue.size); // 3
console.log(queue.front); // 'a'
console.log(queue.dequeue()); // 'a'
console.log(queue.size); // 2
console.log(queue.front); // 'b'
```

| Algorithm | Average | Worst Case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(n)   |    O(n)    |
| Insert    |  O(1)   |    O(1)    |
| Delete    |  O(1)   |    O(1)    |

### Priority Queue

```javascript
import { PriorityQueue } from 'icollections';

const queue = new PriorityQueue();
console.log(queue.size); // 0

queue.enqueue(['I am last one', 4]);
queue.enqueue(['Just the third', 3]);
queue.enqueue(['Almost', 2]);
queue.enqueue(['FIRST ONE, WINNER', 1]);

console.log(queue.front); // ['FIRST ONE, WINNER', 1])

queue.dequeue();

console.log(queue.front); // ['Almost', 2]
```

| Algorithm | Average | Worst Case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(n)   |    O(n)    |
| Insert    |  O(1)   |    O(1)    |
| Delete    |  O(1)   |    O(1)    |

### Set

```javascript
	import { Set } from 'icollections';

    const set = new Set();
    console.log(set.size) // 0

    set.add("a");
    set.add("b");

    console.log(set.size) // 2
    console.log(set.has("a") // true
    console.log(set.has("b")) // true
    console.log(set.values) // ["a", "b"]

    set.remove("a");
    console.log(set.size).toBe(1);
    console.log(set.has("a")) // false

    var setA = new Set();
    var setB = new Set();

    setA.add("a");
    setA.add("b");
    setA.add("c");
    setB.add("a");
    setB.add("c");
    setB.add("z");

    var intersectSet = setA.intersection(setB);

    console.log(intersectSet.size) // 2
    console.log(intersectSet.values) // ["a", "c"]

    var diffSet = setA.difference(setB);

    console.log(diffSet.size) // 1
    console.log(diffSet.values) // ["b"]


    var setA = new Set();
    var setB = new Set();

	setA.add("a");
	setA.add("b");
	setA.add("c");
	setA.add("d");

	setB.add("a");
	setB.add("b");

    console.log(setB.subset(setA)) // true
```

### Map

```javascript
import { Map } from 'icollections';

var map = new Map();
console.log(map.size); // 0

map.set('arms', 2);
map.set('fingers', 10);
map.set('eyes', 2);
map.set('belley button', 1);

console.log(map.size); // 4

let obj = { name: 'languange' };
map.set(obj, 'JavaScript');

console.log(map.has(obj)); // true
console.log(map.has({ name: 'languange' })); // true
console.log(map.get(obj)); // 'JavaScript'
console.log(map.has('arms')); // true
console.log(map.get('arms')); // 2

console.log(map.values); // [2,10,2,1]

map.delete('eyes');
console.log(map.has('eyes')); // false

map.clear();
console.log(map.size); // 0
```

### Hash Tables

```javascript
import { HashTable } from 'icollections';

var hashTable = new HashTable(14);
console.log(hashTable.storageLimit); // 14

hashTable.add('beau', 'person');

console.log(hashTable.lookup('beau')); // 'person'

hashTable.remove('beau');
expect(hashTable.lookup('beau')); // undefined
```

| Algorithm | Average | Worst Case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(1)   |    O(n)    |
| Insert    |  O(1)   |    O(n)    |
| Delete    |  O(1)   |    O(n)    |

---

### Contributing

```
$ git clone https://github.com/assuncaocharles/javascript_DataStructure

cd javascript_DataStructure

npm i
```

#### Running test

```
npm run test
```

---

### To do

-   Graph
-   Binary Heap
