// Builds the API reference from the compiled declaration files (dist/*.d.ts),
// so the docs always match the published types.

/**
 * @typedef {{ signature: string, doc: string, tags: { name: string, text: string }[] }} Member
 * @typedef {{ name: string, signature: string, doc: string, members: Member[] }} ClassDoc
 */

/** Text of a JSDoc block without the comment markers. */
function commentText(raw) {
	return raw
		.replace(/^\/\*\*|\*\/$/g, '')
		.split('\n')
		.map((line) => line.replace(/^\s*\* ?/, ''))
		.join('\n')
		.trim();
}

/** Splits JSDoc text into the description and its @tags. */
function splitTags(text) {
	const [description, ...tagParts] = text.split(/\n?^@|^@/m);
	const tags = tagParts.map((part) => {
		const [, name = '', rest = ''] = /^(\w+)\s*([\s\S]*)$/.exec(part.trim()) ?? [];
		return { name, text: rest.trim() };
	});
	return { doc: (description ?? '').trim(), tags };
}

/**
 * Parses the exported classes of a declaration file.
 *
 * @param {string} source contents of a .d.ts file
 * @returns {ClassDoc[]}
 */
export function parseDeclarations(source) {
	const lines = source.split('\n');
	/** @type {ClassDoc[]} */
	const classes = [];
	/** @type {ClassDoc | null} */
	let current = null;
	let comment = '';
	let collecting = false;
	let buffer = '';

	for (const line of lines) {
		const trimmed = line.trim();
		if (collecting) {
			buffer += `\n${line}`;
			if (trimmed.endsWith('*/')) {
				comment = commentText(buffer);
				collecting = false;
			}
			continue;
		}
		if (trimmed.startsWith('/**')) {
			buffer = trimmed;
			if (trimmed.endsWith('*/')) comment = commentText(trimmed);
			else collecting = true;
			continue;
		}

		const classMatch = /^export declare class (\w+)(.*)\{$/.exec(trimmed);
		if (classMatch) {
			current = {
				name: classMatch[1],
				signature: `class ${classMatch[1]}${classMatch[2].trimEnd()}`,
				...splitTags(comment),
				members: [],
			};
			delete current.tags;
			classes.push(current);
			comment = '';
			continue;
		}
		if (current && trimmed === '}') {
			current = null;
			continue;
		}
		if (current && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
			const signature = trimmed.replace(/;$/, '');
			const previous = current.members.at(-1);
			const name = (sig) => /^(?:get |set |static |readonly )*(\[[^\]]+\]|[\w$]+)/.exec(sig)?.[1];
			// Overloads share the documentation of the first signature.
			if (!comment && previous && name(previous.signature) === name(signature)) {
				previous.signature += `\n${signature}`;
			} else {
				current.members.push({ signature, ...splitTags(comment) });
			}
			comment = '';
			continue;
		}
		if (trimmed) comment = '';
	}
	return classes;
}
