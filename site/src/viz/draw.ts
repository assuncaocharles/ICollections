import {
	BST,
	HashTable,
	LinkedList,
	Map as IMap,
	PriorityQueue,
	Queue,
	Set as ISet,
	Stack,
} from '../../../src/index.js';
import { type BinaryNode, layoutTree } from './layout.js';

/**
 * Visual state of one element:
 * - `visit`: on the path the algorithm has walked
 * - `active`: the element being looked at right now
 * - `found`: the element the operation was looking for, or part of its result
 * - `new`: just added
 * - `remove`: about to be removed
 */
export type Tone = 'visit' | 'active' | 'found' | 'new' | 'remove';

/** Tones keyed by node object (trees, lists) or by index (arrays). */
export type Tones = ReadonlyMap<unknown, Tone>;

const NONE: Tones = new Map();
const SVG_NS = 'http://www.w3.org/2000/svg';

export function svg<K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number> = {},
	...children: (Node | string)[]
): SVGElementTagNameMap[K] {
	const element = document.createElementNS(SVG_NS, tag);
	for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
	element.append(...children);
	return element;
}

export function html<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number | boolean | undefined> = {},
	...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tag);
	for (const [name, value] of Object.entries(attrs)) {
		if (value === undefined || value === false) continue;
		if (name === 'class') element.className = String(value);
		else element.setAttribute(name, value === true ? '' : String(value));
	}
	element.append(...children);
	return element;
}

/** Short, readable label for any value. */
export function label(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') return String(value);
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	try {
		const json = JSON.stringify(value);
		return json.length > 24 ? `${json.slice(0, 22)}…` : json;
	} catch {
		return Object.prototype.toString.call(value);
	}
}

function empty(text: string): HTMLElement {
	return html('div', { class: 'viz-empty' }, text);
}

// ---------- Binary trees ----------

const CELL = 52;
const ROW = 64;
const RADIUS = 18;
const PAD = 28;

export function drawTree<T>(root: BinaryNode<T> | null, tones: Tones = NONE, title = 'Binary search tree'): Element {
	const layout = layoutTree(root);
	if (layout.nodes.length === 0) return empty('The tree is empty. Insert a value to plant the root.');

	const width = layout.columns * CELL + PAD * 2 - (CELL - RADIUS * 2);
	const height = (layout.rows - 1) * ROW + RADIUS * 2 + PAD * 2;
	const cx = (x: number): number => PAD + RADIUS + x * CELL;
	const cy = (y: number): number => PAD + RADIUS + y * ROW;

	const edges = svg('g', { class: 'tree-edges' });
	const nodes = svg('g', { class: 'tree-nodes' });
	for (const { node, x, y, parent } of layout.nodes) {
		if (parent) {
			const tone = tones.get(node);
			edges.append(
				svg('line', {
					x1: cx(parent.x),
					y1: cy(parent.y),
					x2: cx(x),
					y2: cy(y),
					class: tone === 'visit' || tone === 'active' || tone === 'found' ? `edge on` : 'edge',
				}),
			);
		}
		const tone = tones.get(node);
		const text = label(node.data);
		nodes.append(
			svg(
				'g',
				{ class: `tree-node${tone ? ` tone-${tone}` : ''}`, transform: `translate(${cx(x)} ${cy(y)})` },
				svg('circle', { r: RADIUS }),
				svg('text', { 'text-anchor': 'middle', dy: '0.35em', class: text.length > 3 ? 'small' : '' }, text),
			),
		);
	}

	const values = layout.nodes.map(({ node }) => label(node.data)).join(', ');
	return svg(
		'svg',
		{
			class: 'tree',
			viewBox: `0 0 ${width} ${height}`,
			width,
			height,
			role: 'img',
			'aria-label': `${title} with ${layout.nodes.length} nodes, in order: ${values}`,
		},
		edges,
		nodes,
	);
}

// ---------- Sequences (linked list, queue, stack, priority queue) ----------

export interface Cell {
	value: unknown;
	/** Small caption under the value, e.g. a priority. */
	badge?: string;
	tone?: Tone | undefined;
	/** Labels above the cell, e.g. "head". */
	markers?: string[];
}

export interface SequenceOptions {
	/** Draw arrows between cells, ending in a `null` terminator. */
	linked?: boolean;
	vertical?: boolean;
	emptyText: string;
	label: string;
}

export function drawSequence(cells: Cell[], options: SequenceOptions): Element {
	if (cells.length === 0) return empty(options.emptyText);
	const list = html('ol', {
		class: `seq${options.vertical ? ' seq-vertical' : ''}${options.linked ? ' seq-linked' : ''}`,
		'aria-label': `${options.label}: ${cells.map((cell) => label(cell.value)).join(', ')}`,
	});
	cells.forEach((cell, index) => {
		const markers = cell.markers?.length
			? html('span', { class: 'seq-markers' }, ...cell.markers.map((m) => html('span', { class: 'marker' }, m)))
			: '';
		list.append(
			html(
				'li',
				{ class: `seq-item${cell.tone ? ` tone-${cell.tone}` : ''}` },
				markers,
				html(
					'span',
					{ class: 'seq-box' },
					html('span', { class: 'seq-value' }, label(cell.value)),
					cell.badge ? html('span', { class: 'seq-badge' }, cell.badge) : '',
				),
				options.linked ? html('span', { class: 'seq-arrow', 'aria-hidden': 'true' }) : '',
			),
		);
		if (options.linked && index === cells.length - 1) {
			list.append(html('li', { class: 'seq-null', 'aria-hidden': 'true' }, 'null'));
		}
	});
	return list;
}

export function linkedListCells<T>(list: LinkedList<T>, tones: Tones = NONE): Cell[] {
	const cells: Cell[] = [];
	let index = 0;
	for (let node = list.head; node; node = node.next, index++) {
		const markers = [];
		if (node === list.head) markers.push('head');
		if (node === list.tail) markers.push('tail');
		cells.push({ value: node.data, tone: tones.get(node), markers: [String(index), ...markers] });
	}
	return cells;
}

// ---------- Hash table ----------

export function drawHashTable<V>(
	table: HashTable<V>,
	tones: { bucket?: number; key?: string; tone?: Tone } = {},
): Element {
	const buckets: [string, V][][] = Array.from({ length: table.storageLimit }, () => []);
	for (const [key, value] of table) buckets[table.hash(key)]?.push([key, value]);

	return html(
		'ol',
		{ class: 'buckets', 'aria-label': `Hash table with ${table.storageLimit} buckets and ${table.size} entries` },
		...buckets.map((entries, index) =>
			html(
				'li',
				{ class: `bucket${tones.bucket === index ? ' bucket-on' : ''}` },
				html('span', { class: 'bucket-index' }, String(index)),
				entries.length === 0
					? html('span', { class: 'bucket-empty' }, 'empty')
					: html(
							'span',
							{ class: 'bucket-chain' },
							...entries.map(([key, value]) =>
								html(
									'span',
									{
										class: `entry${tones.bucket === index && tones.key === key && tones.tone ? ` tone-${tones.tone}` : ''}`,
									},
									html('span', { class: 'entry-key' }, key),
									html('span', { class: 'entry-value' }, label(value)),
								),
							),
						),
			),
		),
	);
}

// ---------- Sets ----------

export type Region = 'left' | 'both' | 'right';

/** Two overlapping circles: values only in A, in both, and only in B. */
export function drawVenn<T>(
	a: ISet<T>,
	b: ISet<T>,
	lit: ReadonlySet<Region> = new globalThis.Set(),
	active?: T,
): Element {
	const regions: Record<Region, T[]> = { left: [], both: [], right: [] };
	for (const value of a) regions[b.has(value) ? 'both' : 'left'].push(value);
	for (const value of b) if (!a.has(value)) regions.right.push(value);

	const W = 560;
	const H = 300;
	const R = 128;
	const left = { x: W / 2 - 78, y: H / 2 };
	const right = { x: W / 2 + 78, y: H / 2 };
	const columns: Record<Region, number> = { left: left.x - 58, both: W / 2, right: right.x + 58 };

	const clipId = `clip-${Math.random().toString(36).slice(2)}`;
	const lines = (region: Region): SVGElement[] => {
		const values = regions[region];
		const shown = values.slice(0, 7);
		const startY = H / 2 - ((shown.length - 1) * 22) / 2;
		const items: SVGElement[] = shown.map((value, i) =>
			svg(
				'text',
				{
					x: columns[region],
					y: startY + i * 22,
					'text-anchor': 'middle',
					dy: '0.35em',
					class: `venn-value${active !== undefined && value === active ? ' venn-active' : ''}`,
				},
				label(value),
			),
		);
		if (values.length > shown.length) {
			items.push(
				svg(
					'text',
					{ x: columns[region], y: startY + shown.length * 22, 'text-anchor': 'middle', class: 'venn-more' },
					`+${values.length - shown.length} more`,
				),
			);
		}
		return items;
	};

	const description = `Set A: ${[...a].map(label).join(', ') || 'empty'}. Set B: ${[...b].map(label).join(', ') || 'empty'}.`;
	return svg(
		'svg',
		{ class: 'venn', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': description },
		svg('defs', {}, svg('clipPath', { id: clipId }, svg('circle', { cx: left.x, cy: left.y, r: R }))),
		svg('circle', { cx: left.x, cy: left.y, r: R, class: `venn-fill${lit.has('left') ? ' lit' : ''}` }),
		svg('circle', { cx: right.x, cy: right.y, r: R, class: `venn-fill${lit.has('right') ? ' lit' : ''}` }),
		svg('circle', {
			cx: right.x,
			cy: right.y,
			r: R,
			'clip-path': `url(#${clipId})`,
			class: `venn-both${lit.has('both') ? ' lit' : lit.has('left') || lit.has('right') ? ' dim' : ''}`,
		}),
		svg('circle', { cx: left.x, cy: left.y, r: R, class: 'venn-ring' }),
		svg('circle', { cx: right.x, cy: right.y, r: R, class: 'venn-ring' }),
		svg('text', { x: left.x - R + 10, y: 26, class: 'venn-name' }, 'A'),
		svg('text', { x: right.x + R - 22, y: 26, class: 'venn-name' }, 'B'),
		...lines('left'),
		...lines('both'),
		...lines('right'),
	);
}

// ---------- Maps ----------

export function drawEntries(
	entries: [unknown, unknown][],
	highlight?: { key: unknown; tone: Tone },
	caption = 'Map entries',
): Element {
	if (entries.length === 0) return empty('The map is empty. Set a key to add an entry.');
	return html(
		'table',
		{ class: 'entries', 'aria-label': caption },
		html('thead', {}, html('tr', {}, html('th', {}, 'Key'), html('th', {}, 'Type'), html('th', {}, 'Value'))),
		html(
			'tbody',
			{},
			...entries.map(([key, value]) =>
				html(
					'tr',
					{ class: highlight && Object.is(highlight.key, key) ? `tone-${highlight.tone}` : '' },
					html('td', {}, html('code', {}, typeof key === 'string' ? `'${key}'` : label(key))),
					html('td', { class: 'entry-type' }, typeof key),
					html('td', {}, label(value)),
				),
			),
		),
	);
}

// ---------- Any collection ----------

/** Visualizes any ICollections instance, or returns null for other values. */
export function drawCollection(value: unknown): Element | null {
	if (value instanceof BST) return drawTree(value.root);
	if (value instanceof LinkedList) {
		return drawSequence(linkedListCells(value), { linked: true, emptyText: 'Empty list', label: 'Linked list' });
	}
	if (value instanceof Stack) {
		const cells = value.toArray().map((v, i): Cell => ({ value: v, markers: i === 0 ? ['top'] : [] }));
		return drawSequence(cells, { vertical: true, emptyText: 'Empty stack', label: 'Stack, top first' });
	}
	if (value instanceof Queue) {
		return drawSequence(queueCells(value.toArray()), { emptyText: 'Empty queue', label: 'Queue, front first' });
	}
	if (value instanceof PriorityQueue) {
		return drawSequence(priorityCells(value.toArray()), {
			emptyText: 'Empty priority queue',
			label: 'Priority queue, in dequeue order',
		});
	}
	if (value instanceof HashTable) return drawHashTable(value);
	if (value instanceof ISet)
		return drawSequence(
			value.toArray().map((v) => ({ value: v })),
			{
				emptyText: 'Empty set',
				label: 'Set',
			},
		);
	if (value instanceof IMap) return drawEntries(value.entries);
	return null;
}

export function queueCells(values: unknown[], tones: Tones = NONE): Cell[] {
	return values.map((value, i) => ({
		value,
		tone: tones.get(i),
		markers: [i === 0 ? 'front' : '', i === values.length - 1 ? 'back' : ''].filter(Boolean),
	}));
}

export function priorityCells(entries: readonly (readonly [unknown, number])[], tones: Tones = NONE): Cell[] {
	return entries.map(([value, priority], i) => ({
		value,
		badge: `priority ${priority}`,
		tone: tones.get(i),
		markers: i === 0 ? ['next'] : [],
	}));
}
