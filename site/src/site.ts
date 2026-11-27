// Shared behaviour for every page: theme toggle, copy buttons, tab groups,
// and highlighting the docs section in view.

import { copyWithFeedback } from './copy.js';

const root = document.documentElement;
export const THEME_KEY = 'icollections-theme';

function currentTheme(): 'dark' | 'light' {
	const set = root.dataset.theme;
	if (set === 'dark' || set === 'light') return set;
	return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

document.querySelector('#theme-toggle')?.addEventListener('click', () => {
	const next = currentTheme() === 'dark' ? 'light' : 'dark';
	root.dataset.theme = next;
	try {
		localStorage.setItem(THEME_KEY, next);
	} catch {
		// Storage can be unavailable (private mode); the toggle still works for this page.
	}
});

for (const button of document.querySelectorAll<HTMLElement>('.code-block .copy')) {
	button.addEventListener('click', () => {
		const pre = button.closest('.code-block')?.querySelector('pre');
		void copyWithFeedback(button, (pre?.innerText ?? '').replace(/\n$/, ''));
	});
}

// Tab groups: <div class="tabs" data-tabs> with buttons whose aria-controls names a panel.
for (const group of document.querySelectorAll('[data-tabs]')) {
	const buttons = [...group.querySelectorAll('button')];
	const select = (button: HTMLButtonElement): void => {
		for (const b of buttons) {
			const selected = b === button;
			b.setAttribute('aria-selected', String(selected));
			const panel = document.getElementById(b.getAttribute('aria-controls') ?? '');
			if (panel) panel.hidden = !selected;
		}
	};
	for (const b of buttons) b.addEventListener('click', () => select(b));
}

// Docs: highlight the section in view.
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.docs-toc a')];
if (tocLinks.length > 0 && 'IntersectionObserver' in window) {
	const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
	const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter((h) => h !== null);
	const visible = new Set<Element>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) visible.add(entry.target);
				else visible.delete(entry.target);
			}
			const first = headings.find((h) => visible.has(h));
			if (!first) return;
			for (const a of tocLinks) a.classList.toggle('active', a === byId.get(first.id));
		},
		{ rootMargin: '-64px 0px -70% 0px' },
	);
	for (const heading of headings) observer.observe(heading);

	// Close the mobile table of contents after picking a section.
	const details = document.querySelector<HTMLDetailsElement>('.docs-toc');
	for (const a of tocLinks) {
		a.addEventListener('click', () => {
			if (details && matchMedia('(max-width: 900px)').matches) details.open = false;
		});
	}
}
