# ICollections

[![CI](https://github.com/assuncaocharles/ICollections/actions/workflows/ci.yml/badge.svg)](https://github.com/assuncaocharles/ICollections/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/icollections)](https://www.npmjs.com/package/icollections)

> “Bad programmers worry about the code. Good programmers worry about data structures and their relationships.” — Linus Torvalds

Strictly typed, dependency-free data structures for TypeScript and JavaScript:

- [Binary Search Tree](#binary-search-tree)
- [Linked List](#linked-list)
- [Stack](#stack)
- [Queue](#queue)
- [Priority Queue](#priority-queue)
- [Set](#set)
- [Map](#map)
- [Hash Table](#hash-table)

Every collection:

- is generic and fully typed, with no `any` in its public API;
- is iterable, so it works with `for...of`, spread (`[...collection]`) and `Array.from`;
- accepts an iterable of initial values in its constructor;
- has `size`, `isEmpty`, `clear()` and (except `Map` and `HashTable`) `toArray()`;
- returns `undefined` when you read from it while it is empty, instead of throwing.

## Install

```bash
npm i icollections
```

The package is ESM-only and requires Node.js 22.12 or later. CommonJS code can still load it with `require('icollections')`, which Node.js supports for ES modules from 22.12.

Upgrading from 3.x? Read the [migration guide](./CHANGELOG.md#400).

## Usage

### Binary Search Tree

```ts
import { BST } from 'icollections';

const bst = new BST([10, 5, 13, 2, 133, 42, 12]);
//       10
//      /  \
//     5    13
//    /    /  \
//   2    12   133
//             /
//            42

bst.has(42); // true
bst.findMin(); // 2
bst.findMax(); // 133
bst.inOrder(); // [2, 5, 10, 12, 13, 42, 133]
bst.preOrder(); // [10, 5, 2, 13, 12, 133, 42]
bst.postOrder(); // [2, 5, 12, 42, 133, 13, 10]
bst.levelOrder(); // [10, 5, 13, 2, 12, 133, 42]
bst.elementDepth(42); // 3
bst.elementHeight(10); // 3
bst.isBalanced(); // false: 42 is two levels deeper than the free slot under 5

bst.add(10); // false: values are unique
bst.remove(13); // true
```

Values are ordered with `<` and `>` by default. Pass a comparator to store anything else:

```ts
interface User {
	name: string;
	age: number;
}

const byAge = new BST<User>([], (a, b) => a.age - b.age);
byAge.add({ name: 'Ana', age: 31 });
byAge.add({ name: 'Bo', age: 25 });
byAge.findMin(); // { name: 'Bo', age: 25 }
```

`invert()` mirrors the tree. The tree stays searchable afterwards and orders values in reverse:

```ts
const tree = new BST([10, 5, 13]);
tree.invert();
tree.inOrder(); // [13, 10, 5]
tree.findMin(); // 13: the first value in the new order
```

| Operation | Average  | Worst case |
| --------- | :------: | :--------: |
| Space     |   O(n)   |    O(n)    |
| Search    | O(log n) |    O(n)    |
| Insert    | O(log n) |    O(n)    |
| Delete    | O(log n) |    O(n)    |

The tree is not self-balancing, so inserting sorted input produces the worst case. All operations are iterative, so even a list-shaped tree cannot overflow the call stack.

### Linked List

```ts
import { LinkedList } from 'icollections';

const list = new LinkedList([10, 5, 3]);
list.size; // 3

list.addAt(1, 7); // [10, 7, 5, 3]
list.dataAt(1); // 7
list.indexOf(7); // 1

list.remove(3); // true
list.remove(42); // false: nothing removed
list.dataAt(3); // undefined
list.removeAt(0); // 10

[...list]; // [7, 5]
```

`add` (append) is O(1). Index-based operations are O(n). `addAt` and `removeAt` throw a `RangeError` for an index outside the list.

### Stack

```ts
import { Stack } from 'icollections';

const stack = new Stack<number>();
stack.push(10, 5, 7);
stack.peek; // 7
stack.pop(); // 7
stack.size; // 2
[...stack]; // [5, 10]: top to bottom
```

### Queue

```ts
import { Queue } from 'icollections';

const queue = new Queue(['a', 'b', 'c']);
queue.front; // 'a'
queue.dequeue(); // 'a'
queue.size; // 2
queue.enqueue('d');
[...queue]; // ['b', 'c', 'd']
```

`enqueue` and `dequeue` are amortised O(1).

### Priority Queue

A min-priority queue backed by a binary heap. Lower numbers come out first, and equal priorities come out in insertion order.

```ts
import { PriorityQueue } from 'icollections';

const queue = new PriorityQueue<string>();
queue.enqueue('I am last one', 4);
queue.enqueue(['Just the third', 3]); // [value, priority] tuples also work
queue.enqueue('Almost', 2);
queue.enqueue('FIRST ONE, WINNER', 1);

queue.front; // ['FIRST ONE, WINNER', 1]
queue.dequeue(); // 'FIRST ONE, WINNER'
queue.front; // ['Almost', 2]
```

| Operation | Complexity |
| --------- | :--------: |
| enqueue   |  O(log n)  |
| dequeue   |  O(log n)  |
| front     |    O(1)    |

### Set

```ts
import { Set } from 'icollections';

const setA = new Set(['a', 'b', 'c']);
const setB = new Set(['a', 'c', 'z']);

setA.add('a'); // false: already present
setA.union(setB).values; // ['a', 'b', 'c', 'z']
setA.intersection(setB).values; // ['a', 'c']
setA.difference(setB).values; // ['b']
new Set(['a', 'b']).subset(setA); // true
```

`intersection`, `difference` and `subset` accept any object with a `has` method, including the built-in `Set`. `union` accepts any iterable.

### Map

```ts
import { Map } from 'icollections';

const map = new Map<string, number>();
map.set('arms', 2).set('fingers', 10).set('eyes', 2);
map.size; // 3
map.get('arms'); // 2
map.get('tail'); // undefined
map.values; // [2, 10, 2]
map.delete('eyes'); // true

const owners = new Map<object, string>();
const key = { name: 'language' };
owners.set(key, 'JavaScript');
owners.has(key); // true
owners.has({ name: 'language' }); // false: object keys are compared by reference
```

The exported `Set` and `Map` shadow the built-in ones in the files that import them. Import them under another name if you need both, for example `import { Map as IMap } from 'icollections'`.

### Hash Table

A hash table with string keys and separate chaining. The constructor argument is the number of buckets (default 32). It does not limit how many entries the table holds.

```ts
import { HashTable } from 'icollections';

const table = new HashTable<string>(14);
table.storageLimit; // 14

table.add('beau', 'person');
table.lookup('beau'); // 'person'
table.has('beau'); // true
table.remove('beau'); // true
table.lookup('beau'); // undefined
```

| Operation | Average | Worst case |
| --------- | :-----: | :--------: |
| Space     |  O(n)   |    O(n)    |
| Search    |  O(1)   |    O(n)    |
| Insert    |  O(1)   |    O(n)    |
| Delete    |  O(1)   |    O(n)    |

## Contributing

```bash
git clone https://github.com/assuncaocharles/ICollections
cd ICollections
npm install
```

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm test`              | Runs the tests with Vitest                    |
| `npm run test:coverage` | Runs the tests and enforces coverage          |
| `npm run typecheck`     | Type-checks the sources and tests             |
| `npm run format`        | Formats the code with Prettier                |
| `npm run build`         | Compiles to `dist/`                           |
| `npm run lint:package`  | Checks the built package's metadata (publint) |

## Roadmap

- Graph
- Self-balancing tree (AVL or red-black)
