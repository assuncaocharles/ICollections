#!/usr/bin/env node

// Release helpers for GitHub Actions. Not part of the published package.
//
//   node scripts/release.js check-title "<pr title>"
//     Exit 1 if the title is not a Conventional Commit title.
//
//   node scripts/release.js plan
//     Work out the next version from the PR merged in $GITHUB_SHA and write
//     `release`, `version` and `previous_tag` to $GITHUB_OUTPUT.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/** @type {Record<string, 'major' | 'minor' | 'patch' | null>} */
const TYPES = {
	feat: 'minor',
	fix: 'patch',
	perf: 'patch',
	revert: 'patch',
	docs: null,
	chore: null,
	ci: null,
	test: null,
	refactor: null,
	style: null,
	build: null,
};

const TITLE_RE = /^(?<type>[a-z]+)(?:\((?<scope>[^()\s][^()]*)\))?(?<breaking>!)?: (?<subject>\S.*)$/;

/**
 * Parse a Conventional Commit title such as `feat(bst)!: add comparator`.
 * Returns null if the title doesn't follow the format or the type is unknown.
 *
 * @param {string | undefined} title
 */
export function parseTitle(title) {
	const groups = TITLE_RE.exec((title ?? '').trim())?.groups;
	if (!groups?.type || !(groups.type in TYPES)) return null;
	return {
		type: groups.type,
		scope: groups.scope ?? null,
		breaking: Boolean(groups.breaking),
		subject: groups.subject,
	};
}

/**
 * Release type for a title (and optional body): "major", "minor", "patch",
 * or null when the change does not need a release.
 *
 * @param {string} title
 * @param {string} [body]
 */
export function releaseType(title, body = '') {
	const parsed = parseTitle(title);
	if (!parsed) return null;
	if (parsed.breaking || /^BREAKING[ -]CHANGE:/m.test(body)) return 'major';
	return TYPES[parsed.type] ?? null;
}

/** @param {string} version */
function parseVersion(version) {
	const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(version).trim());
	return match ? match.slice(1).map(Number) : null;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 */
function compareVersions(a, b) {
	for (let i = 0; i < 3; i++) {
		if (a[i] !== b[i]) return (a[i] ?? 0) - (b[i] ?? 0);
	}
	return 0;
}

/**
 * Highest stable x.y.z in `versions` (git tags or npm versions).
 *
 * @param {string[]} versions
 */
export function latestVersion(versions) {
	return versions
		.map(parseVersion)
		.filter((version) => version !== null)
		.sort(compareVersions)
		.pop();
}

/**
 * @param {number[] | undefined} version
 * @param {'major' | 'minor' | 'patch'} type
 */
export function bump(version, type) {
	const [major = 0, minor = 0, patch = 0] = version ?? [];
	if (type === 'major') return `${major + 1}.0.0`;
	if (type === 'minor') return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

const VALID_TITLE_HELP = `PR titles must follow Conventional Commits, e.g.:

  feat: add a Graph collection     -> minor release (4.0.0 -> 4.1.0)
  fix(bst): keep size after remove -> patch release (4.0.0 -> 4.0.1)
  feat!: drop Node 22              -> major release (4.0.0 -> 5.0.0)
  docs: fix README typo            -> no release

Release types: feat (minor), fix / perf / revert (patch).
No release: ${Object.keys(TYPES)
	.filter((type) => !TYPES[type])
	.join(', ')}.
Add "!" after the type (or "BREAKING CHANGE:" in the PR description) for a major release.`;

/** @param {string[]} args */
function git(...args) {
	return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** @param {string} path */
async function githubApi(path) {
	/** @type {Record<string, string>} */
	const headers = {
		accept: 'application/vnd.github+json',
		'x-github-api-version': '2022-11-28',
	};
	if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	const response = await fetch(`https://api.github.com${path}`, { headers });
	if (!response.ok) throw new Error(`GitHub API ${path}: ${response.status} ${await response.text()}`);
	return response.json();
}

/**
 * The PR merged in `sha`, or the commit message for direct pushes.
 *
 * @param {string} repo
 * @param {string} sha
 */
async function changeForCommit(repo, sha) {
	/** @type {{ number: number, title: string, body: string | null, merged_at: string | null }[]} */
	const pulls = await githubApi(`/repos/${repo}/commits/${sha}/pulls`);
	const pr = pulls.find((pull) => pull.merged_at);
	if (pr) return { source: `PR #${pr.number}`, title: pr.title, body: pr.body ?? '' };

	const [title = '', ...rest] = git('log', '-1', '--format=%B', sha).split('\n');
	return { source: `commit ${sha.slice(0, 7)}`, title, body: rest.join('\n') };
}

/** @param {string} name */
function npmVersions(name) {
	try {
		const out = execFileSync('npm', ['view', name, 'versions', '--json'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		const parsed = JSON.parse(out);
		return Array.isArray(parsed) ? parsed : [parsed];
	} catch {
		return []; // not published yet
	}
}

/** @param {Record<string, string>} values */
function setOutput(values) {
	const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
	console.log(lines.join('\n'));
	if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
}

/**
 * Decide whether and what to release. Pure, so it can be tested.
 *
 * @param {object} input
 * @param {string} input.tagsAtHead  v* tags already on the commit
 * @param {{ source: string, title: string, body: string } | null} input.change
 * @param {string[]} input.tags      all v* git tags
 * @param {string[]} input.published versions on npm
 * @returns {{ log: string, outputs: Record<string, string> }}
 */
export function decide({ tagsAtHead, change, tags, published }) {
	if (tagsAtHead || !change) {
		return { log: `Already released at this commit (${tagsAtHead}).`, outputs: { release: 'false' } };
	}

	const type = releaseType(change.title, change.body);
	const log = `${change.source}: "${change.title}" -> ${type ?? 'no release'}`;
	if (!type) return { log, outputs: { release: 'false' } };

	const current = latestVersion([...tags, ...published]);
	const previousTag = current ? `v${current.join('.')}` : '';
	return {
		log,
		outputs: {
			release: 'true',
			version: bump(current, type),
			previous_tag: tags.includes(previousTag) ? previousTag : '',
		},
	};
}

async function plan() {
	const sha = process.env.GITHUB_SHA ?? git('rev-parse', 'HEAD');
	const repo = process.env.GITHUB_REPOSITORY ?? '';
	const { name } = JSON.parse(fs.readFileSync('package.json', 'utf8'));

	const tagsAtHead = git('tag', '--points-at', sha, '--list', 'v*');
	const { log, outputs } = decide({
		tagsAtHead,
		change: tagsAtHead ? null : await changeForCommit(repo, sha),
		tags: git('tag', '--list', 'v*').split('\n').filter(Boolean),
		published: tagsAtHead ? [] : npmVersions(name),
	});
	console.log(log);
	setOutput(outputs);
}

async function main() {
	const [command, ...args] = process.argv.slice(2);

	if (command === 'check-title') {
		const title = args.join(' ');
		if (!parseTitle(title)) {
			console.error(`Invalid PR title: "${title}"\n\n${VALID_TITLE_HELP}`);
			process.exit(1);
		}
		const type = releaseType(title);
		console.log(`"${title}" -> ${type ? `${type} release` : 'no release'}`);
		return;
	}

	if (command === 'plan') return plan();

	console.error('Usage: release.js check-title <title> | plan');
	process.exit(2);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
