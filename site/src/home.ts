// The live tree on the home page: repeatedly searches for a value and lights up the path.
import { BST, type BSTNode } from '../../src/index.js';
import { drawTree, type Tone } from './viz/draw.js';

const stage = document.querySelector<HTMLElement>('#hero-tree');
const target = document.querySelector<HTMLElement>('#hero-target');
const steps = document.querySelector<HTMLElement>('#hero-steps');
const caption = document.querySelector<HTMLElement>('#hero-caption');

if (stage && target && steps && caption) {
	const bst = new BST([50, 30, 70, 20, 40, 60, 80, 10, 35, 65, 90]);
	const searches = [65, 35, 90, 42, 10, 60];
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

	async function search(value: number): Promise<void> {
		target!.textContent = String(value);
		const path: BSTNode<number>[] = [];
		let node = bst.root;
		while (node) {
			const tones = new Map<unknown, Tone>(path.map((n) => [n, 'visit']));
			tones.set(node, node.data === value ? 'found' : 'active');
			stage!.replaceChildren(drawTree(bst.root, tones));
			steps!.textContent = `${path.length + 1} ${path.length === 0 ? 'comparison' : 'comparisons'}`;
			if (node.data === value) {
				caption!.textContent = `Found ${value} in ${path.length + 1} of ${bst.size} nodes.`;
				return;
			}
			caption!.textContent = `${value} ${value < node.data ? '<' : '>'} ${node.data}: go ${value < node.data ? 'left' : 'right'}.`;
			await sleep(reduceMotion ? 0 : 750);
			path.push(node);
			node = value < node.data ? node.left : node.right;
		}
		stage!.replaceChildren(drawTree(bst.root, new Map(path.map((n) => [n, 'visit']))));
		caption!.textContent = `${value} is not in the tree: the path ran out after ${path.length} comparisons.`;
	}

	if (reduceMotion) {
		void search(65);
	} else {
		void (async () => {
			for (let i = 0; ; i = (i + 1) % searches.length) {
				await search(searches[i]!);
				await sleep(1800);
			}
		})();
	}
}
