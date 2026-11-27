import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { bump, decide, latestVersion, parseTitle, releaseType } from './release.js';

const script = fileURLToPath(new URL('./release.js', import.meta.url));

describe('release', () => {
	it('maps PR titles to release types', () => {
		const cases = {
			'feat: add a graph': 'minor',
			'feat(bst): add comparator': 'minor',
			'fix: keep size after remove': 'patch',
			'fix(queue): compact storage': 'patch',
			'perf: faster heap': 'patch',
			'revert: undo the thing': 'patch',
			'feat!: drop Node 22': 'major',
			'fix(map)!: compare keys by reference': 'major',
			'refactor!: rename exports': 'major',
			'docs: fix typo': null,
			'chore: update deps': null,
			'ci: add workflow': null,
			'test: more cases': null,
		};
		for (const [title, expected] of Object.entries(cases)) expect(releaseType(title), title).toBe(expected);
	});

	it('treats BREAKING CHANGE in the body as major', () => {
		expect(releaseType('feat: new api', 'Details\n\nBREAKING CHANGE: Map takes two type parameters')).toBe('major');
		expect(releaseType('fix: x', 'mentions breaking change: later')).toBe('patch');
	});

	it('rejects titles that are not Conventional Commits', () => {
		for (const title of [
			'Modernize library: strict types',
			'Add a graph',
			'feat:missing space',
			'feat: ',
			'Feat: capitalized type',
			'feature: unknown type',
			'feat(): empty scope',
			'',
		]) {
			expect(parseTitle(title), JSON.stringify(title)).toBeNull();
		}
		expect(parseTitle('feat(bst)!: add comparator')).toEqual({
			type: 'feat',
			scope: 'bst',
			breaking: true,
			subject: 'add comparator',
		});
	});

	it('picks the highest stable version from tags and npm', () => {
		expect(latestVersion(['v3.0.5', '3.0.16', 'v3.0.9', '4.0.0-beta.1', 'junk'])).toEqual([3, 0, 16]);
		expect(latestVersion([])).toBeUndefined();
	});

	it('bumps the right part', () => {
		expect(bump([3, 0, 16], 'patch')).toBe('3.0.17');
		expect(bump([3, 0, 16], 'minor')).toBe('3.1.0');
		expect(bump([3, 0, 16], 'major')).toBe('4.0.0');
		expect(bump(undefined, 'minor')).toBe('0.1.0');
	});

	it('releases the next version from tags and npm', () => {
		const { outputs } = decide({
			tagsAtHead: '',
			change: { source: 'PR #61', title: 'feat!: modernize the library', body: '' },
			tags: ['v3.0.5', 'v3.0.9'],
			published: ['3.0.9', '3.0.16'],
		});
		// npm is ahead of the tags, so there is no tag to diff the release notes from.
		expect(outputs).toEqual({ release: 'true', version: '4.0.0', previous_tag: '' });
	});

	it('diffs release notes from the previous tag when it exists', () => {
		const { outputs } = decide({
			tagsAtHead: '',
			change: { source: 'PR #62', title: 'fix: x', body: '' },
			tags: ['v4.0.0'],
			published: ['4.0.0'],
		});
		expect(outputs).toEqual({ release: 'true', version: '4.0.1', previous_tag: 'v4.0.0' });
	});

	it('skips no-release titles and already released commits', () => {
		const base = { tags: ['v4.0.0'], published: ['4.0.0'] };
		const docs = { source: 'PR', title: 'docs: x', body: '' };
		expect(decide({ ...base, tagsAtHead: '', change: docs }).outputs).toEqual({ release: 'false' });
		expect(decide({ ...base, tagsAtHead: 'v4.0.0', change: null }).outputs).toEqual({ release: 'false' });
	});

	it('check-title exits 1 with help for invalid titles', () => {
		const ok = spawnSync(process.execPath, [script, 'check-title', 'feat: x'], { encoding: 'utf8' });
		expect(ok.status, ok.stderr).toBe(0);
		expect(ok.stdout).toMatch(/minor release/);

		const bad = spawnSync(process.execPath, [script, 'check-title', 'Add stuff'], { encoding: 'utf8' });
		expect(bad.status).toBe(1);
		expect(bad.stderr).toMatch(/Conventional Commits/);
	});
});
