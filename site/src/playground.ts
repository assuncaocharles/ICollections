import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { type Action, type Ctx, type Demo, DEMOS, guard } from './demos.js';
import { format } from './format.js';
import { copyWithFeedback } from './copy.js';
import { html } from './viz/draw.js';

hljs.registerLanguage('typescript', typescript);

const $ = <T extends HTMLElement>(selector: string): T => {
	const element = document.querySelector<T>(selector);
	if (!element) throw new Error(`Missing ${selector}`);
	return element;
};

// ---------- Speed ----------

const SPEEDS = { slow: 1100, normal: 550, fast: 180, instant: 0 } as const;
type Speed = keyof typeof SPEEDS;
let speed: Speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'normal';

const speedButtons = [...document.querySelectorAll<HTMLButtonElement>('#speed button')];
const syncSpeed = (): void => {
	for (const b of speedButtons) b.setAttribute('aria-pressed', String(b.dataset.speed === speed));
};
for (const b of speedButtons) {
	b.addEventListener('click', () => {
		speed = b.dataset.speed as Speed;
		syncSpeed();
	});
}
syncSpeed();

// ---------- Demo panel ----------

const stage = $('#stage');
const statusLine = $('#status');
const outputStrip = $('#output');
const statsList = $('#stats');
const codeLog = $<HTMLElement>('#code-log code');
const controls = $('#controls');
const vizTitle = $('#viz-title');
const vizSummary = $('#viz-summary');
const docsLink = $<HTMLAnchorElement>('#viz-docs');

let codeLines: string[] = [];
let setupCode = '';
let current: Demo | null = null;
let busy = false;
/** Lets a newer action cut a running animation short. */
let skipRequested = false;

const imports: Record<string, string> = {
	bst: 'BST',
	'linked-list': 'LinkedList',
	stack: 'Stack',
	queue: 'Queue',
	'priority-queue': 'PriorityQueue',
	'hash-table': 'HashTable',
	set: 'Set',
	map: 'Map',
};

function snippet(): string {
	if (!current) return '';
	return [`import { ${imports[current.id]} } from 'icollections';`, '', setupCode, ...codeLines].join('\n');
}

function renderCode(): void {
	codeLog.innerHTML = hljs.highlight(snippet(), { language: 'typescript' }).value;
	const scroller = codeLog.closest('pre');
	if (scroller) scroller.scrollTop = scroller.scrollHeight;
}

const ctx: Ctx = {
	show(element) {
		stage.replaceChildren(element);
	},
	say(text, kind = 'info') {
		statusLine.textContent = text;
		statusLine.dataset.kind = kind;
	},
	log(code, ...rest) {
		codeLines.push(rest.length > 0 ? `${code} // → ${format(rest[0], 1)}` : code);
		renderCode();
	},
	output(values, title = 'result') {
		outputStrip.hidden = values === null;
		if (values === null) return;
		outputStrip.replaceChildren(
			html('span', { class: 'output-title' }, title),
			html(
				'span',
				{ class: 'output-values' },
				...values.map((v) => html('span', { class: 'chip' }, format(v, 1))),
			),
		);
	},
	stats(entries) {
		statsList.replaceChildren(
			...entries.flatMap(([name, value]) => [html('dt', {}, name), html('dd', {}, format(value))]),
		);
	},
	step() {
		const delay = skipRequested ? 0 : SPEEDS[speed];
		return delay === 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, delay));
	},
};

function setBusy(value: boolean): void {
	busy = value;
	controls.classList.toggle('busy', value);
	for (const button of controls.querySelectorAll<HTMLButtonElement>('button[data-action]')) button.disabled = value;
}

async function run(action: Action): Promise<void> {
	if (busy) return;
	const values: Record<string, string> = {};
	for (const input of controls.querySelectorAll<HTMLInputElement>('input[name]')) values[input.name] = input.value;
	setBusy(true);
	skipRequested = false;
	ctx.output(null);
	try {
		await guard(ctx, () => action.run(values));
	} finally {
		setBusy(false);
	}
	const first = controls.querySelector<HTMLInputElement>('input[name]');
	if (first && action.uses.length > 0) first.select();
}

function mount(factory: (ctx: Ctx) => Demo): void {
	const demo = factory(ctx);
	current = demo;
	codeLines = [];
	vizTitle.textContent = demo.title;
	vizSummary.textContent = demo.summary;
	docsLink.href = demo.docs;

	const fields = demo.fields.map((field) =>
		html(
			'label',
			{ class: `field${field.width ? ` field-${field.width}` : ''}` },
			field.label,
			html('input', {
				type: 'text',
				name: field.name,
				placeholder: field.placeholder,
				inputmode: field.kind === 'number' ? 'decimal' : 'text',
				autocomplete: 'off',
				spellcheck: 'false',
			}),
		),
	);
	const buttons = demo.actions.map((action) => {
		const button = html(
			'button',
			{
				type: 'button',
				class: `button button-sm${action.primary ? ' button-primary' : ''}`,
				'data-action': action.label,
				title: action.uses.length ? `Uses: ${action.uses.join(', ')}` : undefined,
			},
			action.label,
		);
		button.addEventListener('click', () => void run(action));
		return button;
	});
	const sample = html(
		'button',
		{ type: 'button', class: 'button button-sm', 'data-action': 'sample' },
		'Sample data',
	);
	const clear = html('button', { type: 'button', class: 'button button-sm', 'data-action': 'clear' }, 'Clear');
	sample.addEventListener('click', () => {
		setupCode = demo.sample();
		codeLines = [];
		start('Loaded sample data. Try an operation.');
	});
	clear.addEventListener('click', () => {
		setupCode = demo.reset();
		codeLines = [];
		start('Cleared.');
	});

	controls.replaceChildren(
		html('div', { class: 'controls-fields' }, ...fields),
		html('div', { class: 'controls-actions', role: 'group', 'aria-label': 'Operations' }, ...buttons),
		html('div', { class: 'controls-reset' }, sample, clear),
	);
	// Enter runs the primary action.
	const primary = demo.actions.find((action) => action.primary);
	for (const input of controls.querySelectorAll('input')) {
		input.addEventListener('keydown', (event) => {
			if (event.key !== 'Enter' || !primary) return;
			event.preventDefault();
			if (busy) skipRequested = true;
			else void run(primary);
		});
	}

	setupCode = demo.sample();
	codeLines = [];
	start(`${demo.title}: pick an operation, or type a value and press Enter.`);
}

function start(message: string): void {
	current?.render();
	ctx.output(null);
	ctx.say(message);
	renderCode();
}

$('#copy-code').addEventListener(
	'click',
	(event) => void copyWithFeedback(event.currentTarget as HTMLElement, snippet()),
);

// ---------- Tabs and routing ----------

const tabs = $('#demo-tabs');
const demoPanel = $('#demo-panel');
const scriptPanel = $('#script-panel');
const factories = new Map(DEMOS.map((factory) => [factory(ctx).id, factory]));
const titles = new Map(DEMOS.map((factory) => [factory(ctx).id, factory(ctx).title]));

const tabButtons = [...factories.keys(), 'code'].map((id) => {
	const button = html(
		'button',
		{
			role: 'tab',
			id: `tab-${id}`,
			'aria-controls': id === 'code' ? 'script-panel' : 'demo-panel',
			'aria-selected': 'false',
		},
		id === 'code' ? 'Write code' : (titles.get(id) ?? id),
	);
	button.addEventListener('click', () => {
		history.replaceState(null, '', `#${id}`);
		route();
	});
	return button;
});
tabs.append(...tabButtons);

let scriptLoaded = false;

function route(): void {
	const id = location.hash.slice(1) || 'bst';
	const selected = id === 'code' || factories.has(id) ? id : 'bst';
	for (const button of tabButtons) button.setAttribute('aria-selected', String(button.id === `tab-${selected}`));
	demoPanel.hidden = selected === 'code';
	scriptPanel.hidden = selected !== 'code';
	if (selected === 'code') {
		if (!scriptLoaded) {
			scriptLoaded = true;
			void import('./script.js');
		}
		return;
	}
	if (current?.id !== selected) mount(factories.get(selected)!);
}

addEventListener('hashchange', route);
route();
