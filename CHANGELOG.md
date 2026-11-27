# Changelog

## 4.0.0

A full modernisation of the library: strict types, bug fixes, faster implementations and a modern toolchain.
Most code written against 3.x keeps working; the breaking changes are listed below.

### Highlights

- **Strict types.** Compiled with TypeScript 7 in `strict` mode, plus `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`. Empty reads are typed `T | undefined` rather than pretending to return `T`.
- **Every collection is iterable** and accepts an iterable of initial values: `new Stack([1, 2, 3])`, `[...bst]`, `for (const [key, value] of map)`.
- **`size`, `isEmpty` and `clear()` everywhere**, and `toArray()` on every collection except `Map` and `HashTable`.
- **`PriorityQueue` is now exported** from the package entry point. It is backed by a binary heap: O(log n) instead of O(n) inserts. Equal priorities keep their insertion order.
- **`BST` accepts a comparator**, so it can store any type: `new BST<User>([], (a, b) => a.age - b.age)`.
- **No more stack overflows:** every `BST` operation is iterative.
- `Queue.dequeue` is amortised O(1) (it was O(n)), and `LinkedList.add` is O(1) (it was O(n)).
- New methods: `has` on `BST`, `LinkedList` and `HashTable`; `LinkedList.tail`; `Map.keys` and `Map.entries`; `HashTable.size`, `keys()` and `values()`.

### Bug fixes

- `Map` turned object keys into the string `"[object Object]"`, so every object key collided. Object keys are now compared by reference, like the built-in `Map`.
- `Map.set` counted an overwrite as a new entry, so `size` drifted.
- `LinkedList.remove(x)` with a value that was not in the list removed the **last** element.
- `LinkedList.indexOf` threw on an empty list.
- `HashTable.remove` threw for a key that was never added, and left holes that later made `lookup` throw.
- `new HashTable()` without arguments had 0 buckets, so every operation failed.
- `BST.invert()` threw on nodes with a single child, and left the tree unsearchable afterwards. The inverted tree now stays searchable and orders values in reverse.
- `BST.findMin`, `findMax` and `find` threw on an empty tree.
- `PriorityQueue.dequeue` threw on an empty queue.
- `Set.values` returned the internal array, so changing the result changed the set.
- `Set.union`, `intersection` and `difference` returned an untyped `Set<unknown>`.

### Breaking changes and migration

**Package**

- The package is ESM-only and requires Node.js 22.12 or later. `require('icollections')` still works on those versions.
- The output moved from `lib/` to `dist/`, and deep imports are no longer supported. Import from `'icollections'`.
- The source files were renamed (for example `src/Binary Search Tree/Binary Search Tree.ts` is now `src/binary-search-tree.ts`).
- The `Node` classes are exported as `BSTNode` and `LinkedListNode`.

**Removed console helpers**: `Queue.print()`, `PriorityQueue.printCollection()` and `HashTable.log()`. Use `console.log(collection.toArray())`, or `console.log([...table])` for a `HashTable`.

**Internal state is private.** Constructors now take initial values instead of internal state, and the fields behind them are gone:

| 3.x                                                         | 4.0                                                  |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| `new Stack(count, storage)`, `stack.count`, `stack.storage` | `new Stack(values)`, `stack.size`                    |
| `queue.collection`, `priorityQueue.collection`              | `toArray()`                                          |
| `set.collection`                                            | `set.values` or `set.toArray()`                      |
| `map.collection`, `map.count`                               | `map.entries`, `map.size`                            |
| `new BST(rootNode)`; assigning `bst.root`                   | `new BST(values, compare?)`; `bst.root` is read-only |

**`Map`** takes two type parameters, like the built-in one: `Map<number>` becomes `Map<string, number>`.
`get` returns `undefined` instead of `null` for a missing key, `values` returns `[]` instead of `null` when empty, `set` returns the map and `delete` returns a boolean.

**`PriorityQueue`**: `isEmpty()` is now a getter, `isEmpty`, consistent with the other collections. `enqueue(value, priority)` is accepted alongside `enqueue([value, priority])`. `dequeue()` returns `undefined` when empty.

**`LinkedList`**

- `dataAt` returns `undefined` instead of `-1` for an index outside the list.
- `remove` returns `false` for a missing value or an empty list, instead of throwing on an empty list.
- `removeAt` returns the removed value.
- Out-of-range indexes throw a `RangeError` instead of an `Error`.
- Values are compared with SameValueZero (`===`, except that `NaN` matches `NaN`) instead of `==`, so `1` no longer matches `'1'`.

**`BST`**

- Traversals (`inOrder`, `preOrder`, `postOrder`, `levelOrder`) return `[]` instead of `null` for an empty tree.
- `add` and `remove` return a boolean.
- `layers()` is deprecated in favour of `levelOrder()`, which returns the same result.

**`HashTable`**

- The default `storageLimit` is 32 buckets instead of 0, and a limit that is not a positive integer throws a `RangeError`.
- `lookup` is typed `V | undefined` instead of `String | T`.
- `remove` returns a boolean.
- Keys are hashed with FNV-1a instead of a sum of character codes, so keys spread more evenly across buckets.

**`Stack`** and **`Queue`**: `push` and `enqueue` accept several values and return the new size.

### Tooling

- TypeScript 3.5 → 7, Jest 24 → Vitest 5.
- Removed the unused Karma configuration, the Jest configuration and the Travis CI pipeline. A GitHub Actions workflow now checks formatting, types, tests with coverage thresholds, the build and the package metadata on Node.js 22 and 24.
- A documentation site with an interactive playground, deployed to GitHub Pages. Its API reference is generated from the published type declarations.
- Releases are automated: every pull request merged into `master` publishes to npm with trusted publishing (no npm token). The version bump comes from the pull request title (Conventional Commits).
- Removed TypeDoc, which does not support TypeScript 7 yet.
