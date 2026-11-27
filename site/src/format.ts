import { BST, HashTable, LinkedList, Map as IMap, PriorityQueue, Queue, Set as ISet, Stack } from '../../src/index.js';

/** Formats a value the way a console would, with a readable summary for collections. */
export function format(value: unknown, depth = 0): string {
	if (typeof value === 'string') return depth === 0 ? value : `'${value}'`;
	if (value === undefined) return 'undefined';
	if (value === null || typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (typeof value === 'bigint') return `${value}n`;
	if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
	if (typeof value === 'symbol') return value.toString();
	if (depth > 3) return '…';

	const items = (values: Iterable<unknown>): string => [...values].map((v) => format(v, depth + 1)).join(', ');
	if (
		value instanceof BST ||
		value instanceof LinkedList ||
		value instanceof Stack ||
		value instanceof Queue ||
		value instanceof ISet
	) {
		return `${value.constructor.name}(${value.size}) [${items(value)}]`;
	}
	if (value instanceof PriorityQueue) return `PriorityQueue(${value.size}) [${items(value)}]`;
	if (value instanceof IMap || value instanceof HashTable) {
		const entries = [...value].map(([k, v]) => `${format(k, depth + 1)} => ${format(v, depth + 1)}`);
		return `${value.constructor.name}(${value.size}) {${entries.join(', ')}}`;
	}
	if (value instanceof Error) return `${value.name}: ${value.message}`;
	if (Array.isArray(value)) return `[${items(value)}]`;
	if (value instanceof globalThis.Map) {
		return `Map(${value.size}) {${[...value].map(([k, v]) => `${format(k, depth + 1)} => ${format(v, depth + 1)}`).join(', ')}}`;
	}
	if (value instanceof globalThis.Set) return `Set(${value.size}) {${items(value)}}`;
	const entries = Object.entries(value as object).map(([k, v]) => `${k}: ${format(v, depth + 1)}`);
	return `{ ${entries.join(', ')} }`.replace('{  }', '{}');
}
