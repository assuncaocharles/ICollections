import {
	BST,
	type BSTNode,
	HashTable,
	LinkedList,
	Map as IMap,
	PriorityQueue,
	Queue,
	Set as ISet,
	Stack,
} from '../../src/index.js';
import {
	type Cell,
	drawEntries,
	drawHashTable,
	drawSequence,
	drawTree,
	drawVenn,
	label,
	linkedListCells,
	priorityCells,
	queueCells,
	type Region,
	type Tone,
} from './viz/draw.js';

/** What a demo can do to the playground around it. */
export interface Ctx {
	/** Replaces the visualization. */
	show(element: Element): void;
	/** Explains the current step (also announced to screen readers). */
	say(text: string, kind?: 'info' | 'ok' | 'err'): void;
	/** Appends a line to the code log, with its result as a comment. */
	log(code: string, result?: unknown): void;
	/** Shows a growing result, e.g. the values a traversal has produced so far. */
	output(values: readonly unknown[] | null, title?: string): void;
	/** Facts shown under the visualization. */
	stats(entries: [string, unknown][]): void;
	/** Pauses between animation frames, according to the chosen speed. */
	step(): Promise<void>;
}

export interface Field {
	name: string;
	label: string;
	placeholder: string;
	kind: 'number' | 'text';
	width?: 'narrow';
}

export interface Action {
	label: string;
	primary?: boolean;
	/** Fields this action reads. */
	uses: string[];
	run(input: Record<string, string>): Promise<void> | void;
}

export interface Demo {
	id: string;
	title: string;
	summary: string;
	docs: string;
	fields: Field[];
	actions: Action[];
	/** Empties the collection. Returns the code that creates it. */
	reset(): string;
	/** Fills the collection with sample data. Returns the code that creates it. */
	sample(): string;
	render(): void;
}

// ---------- Input helpers ----------

class InputError extends Error {}

function numbers(raw: string | undefined, name = 'value'): number[] {
	const parts = (raw ?? '')
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length === 0) throw new InputError(`Enter a ${name}. Separate several with commas.`);
	return parts.map((part) => {
		const value = Number(part);
		if (!Number.isFinite(value)) throw new InputError(`"${part}" is not a number.`);
		return value;
	});
}

function number(raw: string | undefined, name: string): number {
	const [value, ...rest] = numbers(raw, name);
	if (rest.length > 0 || value === undefined) throw new InputError(`Enter a single ${name}.`);
	return value;
}

function index(raw: string | undefined): number {
	const value = number(raw, 'index');
	if (!Number.isInteger(value) || value < 0) throw new InputError('The index must be a whole number, 0 or more.');
	return value;
}

function texts(raw: string | undefined, name = 'value'): string[] {
	const parts = (raw ?? '')
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length === 0) throw new InputError(`Enter a ${name}. Separate several with commas.`);
	return parts;
}

function text(raw: string | undefined, name: string): string {
	const value = (raw ?? '').trim();
	if (!value) throw new InputError(`Enter a ${name}.`);
	return value;
}

/** Wraps an action so bad input is reported instead of thrown. */
export function guard(ctx: Ctx, action: () => Promise<void> | void): Promise<void> {
	return Promise.resolve()
		.then(action)
		.catch((error: unknown) => {
			if (error instanceof InputError || error instanceof RangeError) ctx.say(error.message, 'err');
			else throw error;
		});
}

const list = (values: readonly unknown[]): string =>
	values.map((v) => (typeof v === 'string' ? quote(v) : String(v))).join(', ');

const quote = (value: string): string => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

/** `count` distinct random numbers from 1 to `max`, none of them in `exclude`. */
function sampleNumbers(count: number, exclude: readonly number[] = [], max = 99): number[] {
	const values = new globalThis.Set<number>();
	while (values.size < count) {
		const value = 1 + Math.floor(Math.random() * max);
		if (!exclude.includes(value)) values.add(value);
	}
	return [...values];
}

const WORDS = ['ada', 'grace', 'linus', 'alan', 'barbara', 'ken', 'dennis', 'margaret', 'edsger', 'donald'];

// ---------- Binary search tree ----------

function bstDemo(ctx: Ctx): Demo {
	let bst = new BST<number>();
	let inverted = false;
	const compare = (a: number, b: number): number => (inverted ? b - a : a - b);

	const render = (tones: Map<unknown, Tone> = new Map()): void => {
		ctx.show(drawTree(bst.root, tones));
		ctx.stats([
			['size', bst.size],
			['height', bst.findMaxHeight()],
			['isBalanced()', bst.isBalanced()],
			['order', inverted ? 'descending (inverted)' : 'ascending'],
		]);
	};

	/** Animates the search path for `value` and returns the last node reached. */
	async function walk(
		value: number,
		verb: string,
	): Promise<{ node: BSTNode<number> | null; path: BSTNode<number>[] }> {
		const path: BSTNode<number>[] = [];
		let node = bst.root;
		while (node) {
			const order = compare(value, node.data);
			const tones = new Map<unknown, Tone>(path.map((n) => [n, 'visit']));
			tones.set(node, 'active');
			render(tones);
			if (order === 0) {
				ctx.say(`${value} = ${node.data}: found it.`);
				await ctx.step();
				return { node, path };
			}
			const direction = order < 0 ? 'left' : 'right';
			ctx.say(`${verb} ${value}: ${value} ${value < node.data ? '<' : '>'} ${node.data}, so go ${direction}.`);
			await ctx.step();
			path.push(node);
			node = node[direction];
		}
		return { node: null, path };
	}

	async function traverse(name: string, order: BSTNode<number>[], result: number[]): Promise<void> {
		const done: number[] = [];
		const tones = new Map<unknown, Tone>();
		for (const node of order) {
			for (const [key, tone] of tones) if (tone === 'active') tones.set(key, 'found');
			tones.set(node, 'active');
			done.push(node.data);
			render(tones);
			ctx.output(done, name);
			ctx.say(`Visit ${node.data}.`);
			await ctx.step();
		}
		render();
		ctx.output(result, name);
		ctx.log(`bst.${name}();`, result);
		ctx.say(`${name}() visited ${result.length} nodes.`, 'ok');
	}

	const nodesInOrder = (): BSTNode<number>[] => {
		const out: BSTNode<number>[] = [];
		const stack: BSTNode<number>[] = [];
		let current = bst.root;
		while (current || stack.length) {
			while (current) {
				stack.push(current);
				current = current.left;
			}
			const node = stack.pop()!;
			out.push(node);
			current = node.right;
		}
		return out;
	};

	const nodesPreOrder = (): BSTNode<number>[] => {
		const out: BSTNode<number>[] = [];
		const stack = bst.root ? [bst.root] : [];
		for (let node = stack.pop(); node; node = stack.pop()) {
			out.push(node);
			if (node.right) stack.push(node.right);
			if (node.left) stack.push(node.left);
		}
		return out;
	};

	const nodesPostOrder = (): BSTNode<number>[] => {
		const out: BSTNode<number>[] = [];
		const stack = bst.root ? [bst.root] : [];
		for (let node = stack.pop(); node; node = stack.pop()) {
			out.push(node);
			if (node.left) stack.push(node.left);
			if (node.right) stack.push(node.right);
		}
		return out.reverse();
	};

	const nodesLevelOrder = (): BSTNode<number>[] => {
		const out: BSTNode<number>[] = bst.root ? [bst.root] : [];
		for (let i = 0; i < out.length; i++) {
			const node = out[i]!;
			if (node.left) out.push(node.left);
			if (node.right) out.push(node.right);
		}
		return out;
	};

	async function extreme(side: 'left' | 'right'): Promise<void> {
		const method = side === 'left' ? 'findMin' : 'findMax';
		const path: BSTNode<number>[] = [];
		for (let node = bst.root; node; node = node[side]) {
			path.push(node);
			render(new Map<unknown, Tone>(path.map((n, i) => [n, i === path.length - 1 ? 'active' : 'visit'])));
			ctx.say(node[side] ? `Keep going ${side}.` : `No ${side} child: this is the answer.`);
			await ctx.step();
		}
		const result = bst[method]();
		const last = path.at(-1);
		render(last ? new Map<unknown, Tone>([[last, 'found']]) : new Map());
		ctx.log(`bst.${method}();`, result);
		ctx.say(result === undefined ? 'The tree is empty.' : `${method}() is ${result}.`, 'ok');
	}

	return {
		id: 'bst',
		title: 'Binary search tree',
		summary:
			'Every value in a left subtree is smaller than its parent, every value on the right is larger. Watch searches walk a single path from the root.',
		docs: 'docs.html#binary-search-tree',
		fields: [{ name: 'value', label: 'Value', placeholder: '42 or 4, 8, 15', kind: 'number' }],
		reset() {
			bst = new BST();
			inverted = false;
			return 'const bst = new BST<number>();';
		},
		sample() {
			const base = [50, 30, 70, 20, 40, 60, 80];
			const values = [...base, ...sampleNumbers(4, base)];
			bst = new BST(values);
			inverted = false;
			return `const bst = new BST([${list(values)}]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Insert',
				primary: true,
				uses: ['value'],
				async run({ value }) {
					for (const v of numbers(value)) {
						const { node } = await walk(v, 'Insert');
						const added = bst.add(v);
						const inserted = bst.find(v);
						render(inserted ? new Map<unknown, Tone>([[inserted, added ? 'new' : 'found']]) : new Map());
						ctx.log(`bst.add(${v});`, added);
						ctx.say(
							added ? `Added ${v} as a leaf.` : `${v} is already in the tree, so add() returns false.`,
							added ? 'ok' : 'info',
						);
						if (node) await ctx.step();
					}
				},
			},
			{
				label: 'Search',
				uses: ['value'],
				async run({ value }) {
					const v = number(value, 'value');
					const { node, path } = await walk(v, 'Search for');
					render(
						new Map<unknown, Tone>([
							...path.map((n): [unknown, Tone] => [n, 'visit']),
							...(node ? [[node, 'found'] as [unknown, Tone]] : []),
						]),
					);
					ctx.log(`bst.has(${v});`, bst.has(v));
					ctx.say(
						node
							? `Found ${v} after ${path.length + 1} comparisons.`
							: `${v} is not in the tree: the path ran out after ${path.length} comparisons.`,
						node ? 'ok' : 'err',
					);
				},
			},
			{
				label: 'Remove',
				uses: ['value'],
				async run({ value }) {
					for (const v of numbers(value)) {
						const { node } = await walk(v, 'Remove');
						if (node) {
							const tones = new Map<unknown, Tone>([[node, 'remove']]);
							if (node.left && node.right) {
								let successor = node.right;
								while (successor.left) successor = successor.left;
								tones.set(successor, 'found');
								ctx.say(
									`${v} has two children: replace it with its in-order successor, ${successor.data}.`,
								);
							} else {
								ctx.say(
									node.left || node.right
										? `${v} has one child, which takes its place.`
										: `${v} is a leaf: just unlink it.`,
								);
							}
							render(tones);
							await ctx.step();
						}
						const removed = bst.remove(v);
						render();
						ctx.log(`bst.remove(${v});`, removed);
						if (!removed) ctx.say(`${v} is not in the tree, so remove() returns false.`, 'err');
						else ctx.say(`Removed ${v}.`, 'ok');
					}
				},
			},
			{ label: 'Min', uses: [], run: () => extreme('left') },
			{ label: 'Max', uses: [], run: () => extreme('right') },
			{ label: 'In-order', uses: [], run: () => traverse('inOrder', nodesInOrder(), bst.inOrder()) },
			{ label: 'Pre-order', uses: [], run: () => traverse('preOrder', nodesPreOrder(), bst.preOrder()) },
			{ label: 'Post-order', uses: [], run: () => traverse('postOrder', nodesPostOrder(), bst.postOrder()) },
			{ label: 'Level-order', uses: [], run: () => traverse('levelOrder', nodesLevelOrder(), bst.levelOrder()) },
			{
				label: 'Invert',
				uses: [],
				run() {
					bst.invert();
					inverted = !inverted;
					render();
					ctx.log('bst.invert();');
					ctx.say('Mirrored every node. The tree stays searchable: it now orders values in reverse.', 'ok');
				},
			},
		],
	};
}

// ---------- Linked list ----------

function linkedListDemo(ctx: Ctx): Demo {
	let list = new LinkedList<number>();

	const render = (tones: Map<unknown, Tone> = new Map()): void => {
		ctx.show(
			drawSequence(linkedListCells(list, tones), {
				linked: true,
				emptyText: 'The list is empty. Append a value.',
				label: 'Linked list',
			}),
		);
		ctx.stats([
			['size', list.size],
			['head', list.head?.data],
			['tail', list.tail?.data],
		]);
	};

	/** Animates walking from the head; stops at `index` or when `match` returns true. */
	async function walk(stop: (node: { data: number }, i: number) => boolean): Promise<number> {
		let i = 0;
		const visited = new Map<unknown, Tone>();
		for (let node = list.head; node; node = node.next, i++) {
			visited.set(node, 'active');
			render(visited);
			if (stop(node, i)) return i;
			ctx.say(`Node ${i} holds ${node.data}. Follow next.`);
			await ctx.step();
			visited.set(node, 'visit');
		}
		return -1;
	}

	const nodeAt = (i: number): unknown => {
		let node = list.head;
		for (let k = 0; k < i && node; k++) node = node.next;
		return node;
	};

	return {
		id: 'linked-list',
		title: 'Linked list',
		summary:
			'Each node points to the next. Appending is O(1) thanks to a tail pointer, but reaching index i means walking i links.',
		docs: 'docs.html#linked-list',
		fields: [
			{ name: 'value', label: 'Value', placeholder: '7 or 1, 2, 3', kind: 'number' },
			{ name: 'index', label: 'Index', placeholder: '0', kind: 'number', width: 'narrow' },
		],
		reset() {
			list = new LinkedList();
			return 'const list = new LinkedList<number>();';
		},
		sample() {
			const values = sampleNumbers(5);
			list = new LinkedList(values);
			return `const list = new LinkedList([${values.join(', ')}]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Append',
				primary: true,
				uses: ['value'],
				run({ value }) {
					for (const v of numbers(value)) {
						list.add(v);
						ctx.log(`list.add(${v});`);
					}
					render(new Map([[list.tail, 'new']]));
					ctx.say('Appended at the tail in O(1): no walking needed.', 'ok');
				},
			},
			{
				label: 'Insert at',
				uses: ['value', 'index'],
				async run({ value, index: rawIndex }) {
					const v = number(value, 'value');
					const i = index(rawIndex);
					if (i > list.size) throw new InputError(`Index ${i} is out of range: use 0 to ${list.size}.`);
					if (i > 0) await walk((_, k) => k === i - 1);
					list.addAt(i, v);
					render(new Map([[nodeAt(i), 'new']]));
					ctx.log(`list.addAt(${i}, ${v});`);
					ctx.say(i === 0 ? 'Inserted at the head.' : `Linked ${v} after node ${i - 1}.`, 'ok');
				},
			},
			{
				label: 'Remove',
				uses: ['value'],
				async run({ value }) {
					const v = number(value, 'value');
					const at = await walk((node) => node.data === v);
					if (at !== -1) {
						render(new Map([[nodeAt(at), 'remove']]));
						ctx.say(`Found ${v} at index ${at}: point the previous node past it.`);
						await ctx.step();
					}
					const removed = list.remove(v);
					render();
					ctx.log(`list.remove(${v});`, removed);
					ctx.say(removed ? `Removed ${v}.` : `${v} is not in the list.`, removed ? 'ok' : 'err');
				},
			},
			{
				label: 'Remove at',
				uses: ['index'],
				async run({ index: rawIndex }) {
					const i = index(rawIndex);
					if (i >= list.size)
						throw new InputError(
							list.size ? `Index ${i} is out of range: use 0 to ${list.size - 1}.` : 'The list is empty.',
						);
					await walk((_, k) => k === i);
					render(new Map([[nodeAt(i), 'remove']]));
					await ctx.step();
					const removed = list.removeAt(i);
					render();
					ctx.log(`list.removeAt(${i});`, removed);
					ctx.say(`Removed ${removed} from index ${i}.`, 'ok');
				},
			},
			{
				label: 'Index of',
				uses: ['value'],
				async run({ value }) {
					const v = number(value, 'value');
					const at = await walk((node) => node.data === v);
					render(at === -1 ? new Map() : new Map([[nodeAt(at), 'found']]));
					ctx.log(`list.indexOf(${v});`, list.indexOf(v));
					ctx.say(
						at === -1 ? `${v} is not in the list.` : `${v} is at index ${at}.`,
						at === -1 ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Get at',
				uses: ['index'],
				async run({ index: rawIndex }) {
					const i = index(rawIndex);
					const found = i < list.size ? await walk((_, k) => k === i) : -1;
					render(found === -1 ? new Map() : new Map([[nodeAt(i), 'found']]));
					const result = list.dataAt(i);
					ctx.log(`list.dataAt(${i});`, result);
					ctx.say(
						result === undefined ? `Index ${i} is past the end.` : `Index ${i} holds ${result}.`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
		],
	};
}

// ---------- Stack ----------

function stackDemo(ctx: Ctx): Demo {
	let stack = new Stack<string>();
	const render = (tone?: Tone): void => {
		const cells = stack
			.toArray()
			.map((value, i): Cell => ({ value, tone: i === 0 ? tone : undefined, markers: i === 0 ? ['top'] : [] }));
		ctx.show(
			drawSequence(cells, {
				vertical: true,
				emptyText: 'The stack is empty. Push a value.',
				label: 'Stack, top first',
			}),
		);
		ctx.stats([
			['size', stack.size],
			['peek', stack.peek],
		]);
	};
	return {
		id: 'stack',
		title: 'Stack',
		summary: 'Last in, first out. Push and pop both work on the top, in O(1).',
		docs: 'docs.html#stack',
		fields: [{ name: 'value', label: 'Value', placeholder: 'plate or a, b, c', kind: 'text' }],
		reset() {
			stack = new Stack();
			return 'const stack = new Stack<string>();';
		},
		sample() {
			const values = WORDS.slice(0, 4);
			stack = new Stack(values);
			return `const stack = new Stack([${list(values)}]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Push',
				primary: true,
				uses: ['value'],
				run({ value }) {
					const values = texts(value);
					const size = stack.push(...values);
					render('new');
					ctx.log(`stack.push(${values.map(quote).join(', ')});`, size);
					ctx.say(`Pushed onto the top. Size is now ${size}.`, 'ok');
				},
			},
			{
				label: 'Pop',
				uses: [],
				async run() {
					if (!stack.isEmpty) {
						render('remove');
						await ctx.step();
					}
					const result = stack.pop();
					render();
					ctx.log('stack.pop();', result);
					ctx.say(
						result === undefined
							? 'The stack is empty, so pop() returns undefined.'
							: `Popped ${result} off the top.`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Peek',
				uses: [],
				run() {
					render(stack.isEmpty ? undefined : 'found');
					ctx.log('stack.peek;', stack.peek);
					ctx.say(
						stack.isEmpty ? 'Nothing to peek at.' : `The top is ${stack.peek}. Peeking does not remove it.`,
					);
				},
			},
		],
	};
}

// ---------- Queue ----------

function queueDemo(ctx: Ctx): Demo {
	let queue = new Queue<string>();
	const render = (tones: Map<unknown, Tone> = new Map()): void => {
		ctx.show(
			drawSequence(queueCells(queue.toArray(), tones), {
				emptyText: 'The queue is empty. Enqueue a value.',
				label: 'Queue, front first',
			}),
		);
		ctx.stats([
			['size', queue.size],
			['front', queue.front],
		]);
	};
	return {
		id: 'queue',
		title: 'Queue',
		summary: 'First in, first out. Values join at the back and leave from the front, both in amortised O(1).',
		docs: 'docs.html#queue',
		fields: [{ name: 'value', label: 'Value', placeholder: 'task or a, b, c', kind: 'text' }],
		reset() {
			queue = new Queue();
			return 'const queue = new Queue<string>();';
		},
		sample() {
			const values = WORDS.slice(2, 6);
			queue = new Queue(values);
			return `const queue = new Queue([${list(values)}]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Enqueue',
				primary: true,
				uses: ['value'],
				run({ value }) {
					const values = texts(value);
					const size = queue.enqueue(...values);
					render(new Map(values.map((_, i) => [size - 1 - i, 'new'])));
					ctx.log(`queue.enqueue(${values.map(quote).join(', ')});`, size);
					ctx.say('Joined at the back.', 'ok');
				},
			},
			{
				label: 'Dequeue',
				uses: [],
				async run() {
					if (!queue.isEmpty) {
						render(new Map([[0, 'remove']]));
						await ctx.step();
					}
					const result = queue.dequeue();
					render();
					ctx.log('queue.dequeue();', result);
					ctx.say(
						result === undefined
							? 'The queue is empty, so dequeue() returns undefined.'
							: `${result} left from the front.`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Front',
				uses: [],
				run() {
					render(queue.isEmpty ? new Map() : new Map([[0, 'found']]));
					ctx.log('queue.front;', queue.front);
					ctx.say(queue.isEmpty ? 'The queue is empty.' : `${queue.front} is next in line.`);
				},
			},
		],
	};
}

// ---------- Priority queue ----------

function priorityQueueDemo(ctx: Ctx): Demo {
	let queue = new PriorityQueue<string>();
	const render = (tones: Map<unknown, Tone> = new Map()): void => {
		ctx.show(
			drawSequence(priorityCells(queue.toArray(), tones), {
				emptyText: 'The queue is empty. Enqueue a value with a priority.',
				label: 'Priority queue, in dequeue order',
			}),
		);
		ctx.stats([
			['size', queue.size],
			['front', queue.front && `${queue.front[0]} (priority ${queue.front[1]})`],
		]);
	};
	return {
		id: 'priority-queue',
		title: 'Priority queue',
		summary:
			'A binary heap that always hands out the lowest priority number first, in O(log n). Values with equal priority leave in the order they arrived.',
		docs: 'docs.html#priority-queue',
		fields: [
			{ name: 'value', label: 'Value', placeholder: 'fix login', kind: 'text' },
			{ name: 'priority', label: 'Priority', placeholder: '1', kind: 'number', width: 'narrow' },
		],
		reset() {
			queue = new PriorityQueue();
			return 'const queue = new PriorityQueue<string>();';
		},
		sample() {
			const entries: [string, number][] = [
				['write docs', 3],
				['fix outage', 1],
				['review PR', 2],
				['refactor', 5],
				['answer email', 2],
			];
			queue = new PriorityQueue(entries);
			return `const queue = new PriorityQueue<string>([\n${entries.map(([v, p]) => `\t[${quote(v)}, ${p}],`).join('\n')}\n]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Enqueue',
				primary: true,
				uses: ['value', 'priority'],
				run({ value, priority }) {
					const v = text(value, 'value');
					const p = number(priority, 'priority');
					queue.enqueue(v, p);
					// The new entry is the last one with its priority, since ties keep insertion order.
					const entries = queue.toArray();
					let at = -1;
					entries.forEach(([entry, entryPriority], i) => {
						if (entry === v && entryPriority === p) at = i;
					});
					render(new Map([[at, 'new']]));
					ctx.log(`queue.enqueue(${quote(v)}, ${p});`, queue.size);
					ctx.say(
						at === 0
							? `${v} goes straight to the front.`
							: `${v} will come out after ${at} other ${at === 1 ? 'value' : 'values'}.`,
						'ok',
					);
				},
			},
			{
				label: 'Dequeue',
				uses: [],
				async run() {
					if (!queue.isEmpty) {
						render(new Map([[0, 'remove']]));
						await ctx.step();
					}
					const result = queue.dequeue();
					render();
					ctx.log('queue.dequeue();', result);
					ctx.say(
						result === undefined ? 'The queue is empty.' : `${result} had the lowest priority number.`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Front',
				uses: [],
				run() {
					render(queue.isEmpty ? new Map() : new Map([[0, 'found']]));
					ctx.log('queue.front;', queue.front);
				},
			},
		],
	};
}

// ---------- Hash table ----------

function hashTableDemo(ctx: Ctx): Demo {
	let buckets = 8;
	let table = new HashTable<string>(buckets);

	const render = (highlight: { bucket?: number; key?: string; tone?: Tone } = {}): void => {
		ctx.show(drawHashTable(table, highlight));
		ctx.stats([
			['size', table.size],
			['storageLimit', table.storageLimit],
			['load factor', (table.size / table.storageLimit).toFixed(2)],
		]);
	};

	async function locate(key: string): Promise<number> {
		const bucket = table.hash(key);
		render({ bucket });
		ctx.say(`hash(${quote(key)}) = ${bucket}: the key lives in bucket ${bucket} of ${table.storageLimit}.`);
		await ctx.step();
		return bucket;
	}

	return {
		id: 'hash-table',
		title: 'Hash table',
		summary:
			'A hash function turns each key into a bucket number, so lookups jump straight to one bucket. Keys that land in the same bucket share a chain.',
		docs: 'docs.html#hash-table',
		fields: [
			{ name: 'key', label: 'Key', placeholder: 'beau', kind: 'text' },
			{ name: 'value', label: 'Value', placeholder: 'person', kind: 'text' },
		],
		reset() {
			table = new HashTable(buckets);
			return `const table = new HashTable<string>(${buckets});`;
		},
		sample() {
			table = new HashTable(buckets);
			const lines = [`const table = new HashTable<string>(${buckets});`];
			for (const word of WORDS.slice(0, 7)) {
				const role = word.length > 4 ? 'engineer' : 'hacker';
				table.add(word, role);
				lines.push(`table.add(${quote(word)}, ${quote(role)});`);
			}
			return lines.join('\n');
		},
		render: () => render(),
		actions: [
			{
				label: 'Add',
				primary: true,
				uses: ['key', 'value'],
				async run({ key, value }) {
					const k = text(key, 'key');
					const v = text(value, 'value');
					const bucket = await locate(k);
					const existed = table.has(k);
					table.add(k, v);
					render({ bucket, key: k, tone: 'new' });
					ctx.log(`table.add(${quote(k)}, ${quote(v)});`);
					ctx.say(
						existed ? `${k} was already there: its value was replaced.` : `Added ${k} to bucket ${bucket}.`,
						'ok',
					);
				},
			},
			{
				label: 'Lookup',
				uses: ['key'],
				async run({ key }) {
					const k = text(key, 'key');
					const bucket = await locate(k);
					const result = table.lookup(k);
					render({ bucket, key: k, tone: 'found' });
					ctx.log(`table.lookup(${quote(k)});`, result);
					ctx.say(
						result === undefined ? `Bucket ${bucket} has no ${k}.` : `${k} → ${result}.`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Remove',
				uses: ['key'],
				async run({ key }) {
					const k = text(key, 'key');
					const bucket = await locate(k);
					if (table.has(k)) {
						render({ bucket, key: k, tone: 'remove' });
						await ctx.step();
					}
					const removed = table.remove(k);
					render({ bucket });
					ctx.log(`table.remove(${quote(k)});`, removed);
					ctx.say(removed ? `Removed ${k}.` : `${k} is not in the table.`, removed ? 'ok' : 'err');
				},
			},
			{
				label: 'Buckets: 4 / 8 / 16',
				uses: [],
				run() {
					buckets = buckets === 16 ? 4 : buckets * 2;
					const entries = [...table];
					table = new HashTable(buckets);
					for (const [k, v] of entries) table.add(k, v);
					render();
					ctx.log(`// Rehashed into new HashTable<string>(${buckets}), re-adding ${entries.length} entries`);
					ctx.say(`Rehashed into ${buckets} buckets. More buckets, shorter chains.`, 'ok');
				},
			},
		],
	};
}

// ---------- Set ----------

function setDemo(ctx: Ctx): Demo {
	let a = new ISet<string>();
	let b = new ISet<string>();

	const render = (lit?: ReadonlySet<Region>, active?: string): void => {
		ctx.show(drawVenn(a, b, lit, active));
		ctx.stats([
			['a.size', a.size],
			['b.size', b.size],
		]);
	};

	const operation = (name: 'union' | 'intersection' | 'difference', regions: Region[]): Action => ({
		label: name === 'difference' ? 'A − B' : name === 'union' ? 'A ∪ B' : 'A ∩ B',
		uses: [],
		run() {
			const result = a[name](b);
			render(new globalThis.Set(regions));
			ctx.output(result.values, `a.${name}(b)`);
			ctx.log(`a.${name}(b).values;`, result.values);
			ctx.say(`${name}: ${result.size} ${result.size === 1 ? 'value' : 'values'}.`, 'ok');
		},
	});

	return {
		id: 'set',
		title: 'Set',
		summary: 'Unique values with set algebra. Add values to A and B, then combine them.',
		docs: 'docs.html#set',
		fields: [{ name: 'value', label: 'Value', placeholder: 'ada or ada, alan', kind: 'text' }],
		reset() {
			a = new ISet();
			b = new ISet();
			return 'const a = new Set<string>();\nconst b = new Set<string>();';
		},
		sample() {
			const left = ['ada', 'grace', 'linus', 'alan'];
			const right = ['alan', 'ken', 'grace', 'dennis'];
			a = new ISet(left);
			b = new ISet(right);
			return `const a = new Set([${list(left)}]);\nconst b = new Set([${list(right)}]);`;
		},
		render: () => render(),
		actions: [
			...(['a', 'b'] as const).map((name): Action => ({
				label: `Add to ${name.toUpperCase()}`,
				primary: name === 'a',
				uses: ['value'],
				run({ value }) {
					const target = name === 'a' ? a : b;
					const values = texts(value);
					const added = values.filter((v) => {
						const result = target.add(v);
						ctx.log(`${name}.add(${quote(v)});`, result);
						return result;
					});
					render(undefined, values.at(-1));
					ctx.output(null);
					ctx.say(
						added.length === values.length
							? `Added to ${name.toUpperCase()}.`
							: `${values.length - added.length === 1 ? 'A value was' : 'Some values were'} already in ${name.toUpperCase()}: add() returned false.`,
						added.length ? 'ok' : 'info',
					);
				},
			})),
			{
				label: 'Remove',
				uses: ['value'],
				run({ value }) {
					const v = text(value, 'value');
					ctx.log(`a.remove(${quote(v)});`, a.remove(v));
					ctx.log(`b.remove(${quote(v)});`, b.remove(v));
					render();
					ctx.output(null);
				},
			},
			operation('union', ['left', 'both', 'right']),
			operation('intersection', ['both']),
			operation('difference', ['left']),
			{
				label: 'A ⊆ B?',
				uses: [],
				run() {
					const result = a.subset(b);
					render(new globalThis.Set<Region>(['left']));
					ctx.output(null);
					ctx.log('a.subset(b);', result);
					ctx.say(
						result ? 'Every value of A is also in B.' : 'A has values outside B, highlighted on the left.',
						result ? 'ok' : 'err',
					);
				},
			},
		],
	};
}

// ---------- Map ----------

function parseKey(raw: string): string | number {
	return raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : raw;
}

function mapDemo(ctx: Ctx): Demo {
	let map = new IMap<string | number, string>();
	const keyCode = (key: string | number): string => (typeof key === 'number' ? String(key) : quote(key));
	const render = (highlight?: { key: unknown; tone: Tone }): void => {
		ctx.show(drawEntries(map.entries, highlight));
		ctx.stats([['size', map.size]]);
	};
	return {
		id: 'map',
		title: 'Map',
		summary: 'Key/value pairs with keys of any type. Note that the number 1 and the string "1" are different keys.',
		docs: 'docs.html#map',
		fields: [
			{ name: 'key', label: 'Key', placeholder: 'arms or 1', kind: 'text' },
			{ name: 'value', label: 'Value', placeholder: 'two', kind: 'text' },
		],
		reset() {
			map = new IMap();
			return 'const map = new Map<string | number, string>();';
		},
		sample() {
			const entries: [string | number, string][] = [
				['arms', 'two'],
				['fingers', 'ten'],
				[1, 'number one'],
				['1', 'string one'],
			];
			map = new IMap(entries);
			return `const map = new Map<string | number, string>([\n${entries.map(([k, v]) => `\t[${keyCode(k)}, ${quote(v)}],`).join('\n')}\n]);`;
		},
		render: () => render(),
		actions: [
			{
				label: 'Set',
				primary: true,
				uses: ['key', 'value'],
				run({ key, value }) {
					const k = parseKey(text(key, 'key'));
					const v = text(value, 'value');
					const existed = map.has(k);
					map.set(k, v);
					render({ key: k, tone: 'new' });
					ctx.log(`map.set(${keyCode(k)}, ${quote(v)});`);
					ctx.say(existed ? 'Replaced the value; the size did not change.' : 'Added a new entry.', 'ok');
				},
			},
			{
				label: 'Get',
				uses: ['key'],
				run({ key }) {
					const k = parseKey(text(key, 'key'));
					const result = map.get(k);
					render({ key: k, tone: 'found' });
					ctx.log(`map.get(${keyCode(k)});`, result);
					ctx.say(
						result === undefined ? `No entry for ${keyCode(k)}.` : `${keyCode(k)} → ${result}`,
						result === undefined ? 'err' : 'ok',
					);
				},
			},
			{
				label: 'Delete',
				uses: ['key'],
				run({ key }) {
					const k = parseKey(text(key, 'key'));
					const removed = map.delete(k);
					render();
					ctx.log(`map.delete(${keyCode(k)});`, removed);
					ctx.say(removed ? 'Deleted.' : `No entry for ${keyCode(k)}.`, removed ? 'ok' : 'err');
				},
			},
		],
	};
}

export const DEMOS: readonly ((ctx: Ctx) => Demo)[] = [
	bstDemo,
	linkedListDemo,
	stackDemo,
	queueDemo,
	priorityQueueDemo,
	hashTableDemo,
	setDemo,
	mapDemo,
];

export { label };
