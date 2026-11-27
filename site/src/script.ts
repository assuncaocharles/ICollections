// The "Write code" tab: runs TypeScript against the real library, in the browser.
// Loaded on demand, so the transpiler is only downloaded when someone opens the tab.

import { transform } from 'sucrase';
import * as icollections from '../../src/index.js';
import { format } from './format.js';
import { drawCollection, html } from './viz/draw.js';

const EXAMPLES: Record<string, { title: string; code: string }> = {
	bst: {
		title: 'Binary search tree with a comparator',
		code: `import { BST } from 'icollections';

interface Task {
  title: string;
  due: number; // days from now
}

const tasks = new BST<Task>([], (a, b) => a.due - b.due);
tasks.add({ title: 'Ship v4', due: 3 });
tasks.add({ title: 'Write docs', due: 1 });
tasks.add({ title: 'Plan v5', due: 30 });

console.log('Next up:', tasks.findMin()?.title);
console.log('In order:', tasks.inOrder().map((task) => task.title));

// Numbers are ordered with < and > by default
const numbers = new BST([50, 30, 70, 20, 40, 60, 80]);
show(numbers, 'A balanced tree');
console.log('balanced?', numbers.isBalanced());
`,
	},
	pq: {
		title: 'Priority queue as a task scheduler',
		code: `import { PriorityQueue } from 'icollections';

const queue = new PriorityQueue<string>();
queue.enqueue('refactor', 5);
queue.enqueue('fix outage', 1);
queue.enqueue('review PR', 2);
queue.enqueue('answer email', 2); // ties keep insertion order

show(queue, 'Dequeue order');

while (!queue.isEmpty) {
  console.log(queue.dequeue());
}
`,
	},
	dijkstra: {
		title: "Dijkstra's shortest paths",
		code: `import { PriorityQueue, Map } from 'icollections';

type Graph = Record<string, Record<string, number>>;

const graph: Graph = {
  A: { B: 4, C: 2 },
  B: { C: 5, D: 10 },
  C: { E: 3 },
  D: { F: 11 },
  E: { D: 4 },
  F: {},
};

function shortestPaths(graph: Graph, source: string): Map<string, number> {
  const distances = new Map<string, number>([[source, 0]]);
  const queue = new PriorityQueue<string>([[source, 0]]);

  while (!queue.isEmpty) {
    const node = queue.dequeue()!;
    const distance = distances.get(node)!;
    for (const [next, weight] of Object.entries(graph[node] ?? {})) {
      const candidate = distance + weight;
      if (candidate < (distances.get(next) ?? Infinity)) {
        distances.set(next, candidate);
        queue.enqueue(next, candidate);
      }
    }
  }
  return distances;
}

const distances = shortestPaths(graph, 'A');
show(distances, 'Distance from A');
console.log(distances);
`,
	},
	brackets: {
		title: 'Balanced brackets with a stack',
		code: `import { Stack } from 'icollections';

const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

function isBalanced(input: string): boolean {
  const stack = new Stack<string>();
  for (const char of input) {
    if ('([{'.includes(char)) stack.push(char);
    else if (char in pairs && stack.pop() !== pairs[char]) return false;
  }
  return stack.isEmpty;
}

for (const input of ['(a[b]{c})', '(]', '{[()()]}', '((']) {
  console.log(input, isBalanced(input));
}

const stack = new Stack(['(', '[', '{']);
show(stack, 'Stack after reading "([{"');
`,
	},
	sets: {
		title: 'Set algebra',
		code: `import { Set } from 'icollections';

const frontend = new Set(['ada', 'grace', 'linus']);
const backend = new Set(['grace', 'ken', 'dennis']);

console.log('everyone', frontend.union(backend).values);
console.log('full-stack', frontend.intersection(backend).values);
console.log('frontend only', frontend.difference(backend).values);

show(frontend.union(backend), 'Union');
`,
	},
	hash: {
		title: 'Word count with a hash table',
		code: `import { HashTable } from 'icollections';

const text = 'the quick brown fox jumps over the lazy dog the end';
const counts = new HashTable<number>(8);

for (const word of text.split(' ')) {
  counts.add(word, (counts.lookup(word) ?? 0) + 1);
}

console.log('the:', counts.lookup('the'));
console.log('distinct words:', counts.size);
show(counts, 'Words by bucket');
`,
	},
};

const editor = document.querySelector<HTMLTextAreaElement>('#script')!;
const consoleOut = document.querySelector<HTMLElement>('#console')!;
const results = document.querySelector<HTMLElement>('#script-viz')!;
const select = document.querySelector<HTMLSelectElement>('#script-example')!;
const runButton = document.querySelector<HTMLButtonElement>('#script-run')!;

select.replaceChildren(...Object.entries(EXAMPLES).map(([id, { title }]) => html('option', { value: id }, title)));
const load = (id: string): void => {
	editor.value = EXAMPLES[id]?.code ?? '';
};
select.addEventListener('change', () => {
	load(select.value);
	void run();
});

// Tab indents instead of leaving the editor; Escape then Tab still moves focus.
let escaped = false;
editor.addEventListener('keydown', (event) => {
	if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
		event.preventDefault();
		void run();
		return;
	}
	if (event.key === 'Escape') {
		escaped = true;
		return;
	}
	if (event.key === 'Tab' && !event.shiftKey && !escaped) {
		event.preventDefault();
		editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
	}
	escaped = false;
});

function print(kind: 'log' | 'warn' | 'error', args: unknown[]): void {
	consoleOut.append(html('div', { class: `console-line console-${kind}` }, args.map((arg) => format(arg)).join(' ')));
}

const sandboxConsole = {
	log: (...args: unknown[]) => print('log', args),
	info: (...args: unknown[]) => print('log', args),
	debug: (...args: unknown[]) => print('log', args),
	warn: (...args: unknown[]) => print('warn', args),
	error: (...args: unknown[]) => print('error', args),
};

function show(value: unknown, title?: string): void {
	const drawing = drawCollection(value);
	results.append(
		html(
			'figure',
			{ class: 'script-figure' },
			html('figcaption', {}, title ?? format(value).slice(0, 80)),
			drawing ?? html('pre', { class: 'script-value' }, format(value)),
		),
	);
}

function require(name: string): unknown {
	if (name === 'icollections') return icollections;
	throw new Error(`Only 'icollections' can be imported here, not '${name}'.`);
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
	...args: string[]
) => (...args: unknown[]) => Promise<void>;

async function run(): Promise<void> {
	consoleOut.replaceChildren();
	results.replaceChildren();
	runButton.disabled = true;
	try {
		const { code } = transform(editor.value, { transforms: ['typescript', 'imports'], filePath: 'playground.ts' });
		// The code runs in this page, in your browser, like code typed into the dev tools console.
		await new AsyncFunction('require', 'exports', 'console', 'show', code)(require, {}, sandboxConsole, show);
		if (results.childElementCount === 0) {
			results.append(html('p', { class: 'viz-empty' }, 'Call show(collection) to draw a collection here.'));
		}
	} catch (error) {
		print('error', [error instanceof Error ? `${error.name}: ${error.message}` : error]);
	} finally {
		runButton.disabled = false;
	}
}

runButton.addEventListener('click', () => void run());
load(select.value);
void run();
