// Builds the GitHub Pages site into site/dist. Run `npm run build` first: the API
// reference is generated from the declaration files in dist/.
//   node site/build.mjs          build once
//   node site/build.mjs --serve  build, then serve on http://localhost:4173

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import hljs from 'highlight.js/lib/common';
import { Marked } from 'marked';
import { parseDeclarations } from './api.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = path.join(here, 'dist');
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');

const REPO = 'https://github.com/assuncaocharles/ICollections';
const NPM = 'https://www.npmjs.com/package/icollections';
const SITE_URL = 'https://assuncaocharles.github.io/ICollections/';

// ---------- Helpers ----------

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function highlight(code, lang) {
	const language = { sh: 'bash', shell: 'bash', ts: 'typescript', js: 'javascript' }[lang] || lang;
	if (language && hljs.getLanguage(language)) return hljs.highlight(code, { language }).value;
	return escapeHtml(code);
}

function version() {
	if (process.env.SITE_VERSION) return process.env.SITE_VERSION;
	try {
		return execFileSync('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*'], {
			cwd: root,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return '';
	}
}

function createSlugger() {
	const seen = new Map();
	return (text) => {
		const base = text
			.toLowerCase()
			.trim()
			.replace(/[^\p{L}\p{N}\s_-]/gu, '')
			.replace(/\s/g, '-');
		const count = seen.get(base) || 0;
		seen.set(base, count + 1);
		return count ? `${base}-${count}` : base;
	};
}

function stripTags(html) {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

const ICONS = {
	copy: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6.5" y="6.5" width="10" height="10" rx="2"/><path d="M13.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5"/></svg>',
	github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
	theme: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2a8 8 0 1 0 0 16V2Z"/><circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
	play: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.34-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z"/></svg>',
	shield: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.5 3.5 5v4.5c0 4 2.8 7 6.5 8 3.7-1 6.5-4 6.5-8V5L10 2.5Z"/><path d="m7.5 10 1.75 1.75L12.75 8"/></svg>',
	loop: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9a6 6 0 0 1 10.2-4.2L16 6.5M16 3v3.5h-3.5M16 11a6 6 0 0 1-10.2 4.2L4 13.5M4 17v-3.5h3.5"/></svg>',
	feather:
		'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 3.5c-5 0-10 4-10 10v3M6.5 13.5h5M16.5 3.5c0 5-3 9-8 10"/></svg>',
	layers: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="m10 3 7.5 4L10 11 2.5 7 10 3Z"/><path d="m2.5 10.5 7.5 4 7.5-4M2.5 14l7.5 4 7.5-4"/></svg>',
	check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="m7 10 2 2 4-4"/></svg>',
	tree: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="4" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/><path d="M9 5.8 6 13.2M11 5.8l3 7.4"/></svg>',
};

const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/><g fill="none" stroke="var(--accent-text)" stroke-width="2.4" stroke-linecap="round"><path d="M16 10.5 10.5 21M16 10.5 21.5 21"/></g><g fill="var(--accent-text)"><circle cx="16" cy="9.5" r="3.2"/><circle cx="10" cy="22" r="3.2"/><circle cx="22" cy="22" r="3.2"/></g></svg>`;

const FAVICON =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f766e"/><path d="M16 10.5 10.5 21M16 10.5 21.5 21" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><g fill="#fff"><circle cx="16" cy="9.5" r="3.2"/><circle cx="10" cy="22" r="3.2"/><circle cx="22" cy="22" r="3.2"/></g></svg>',
	);

function codeBlock(code, lang, title = lang) {
	const head = title ? `<div class="code-title"><span>${escapeHtml(title)}</span></div>` : '';
	return `<div class="code-block">${head}<pre><code>${highlight(code, lang)}</code></pre><button class="copy" aria-label="Copy">${ICONS.copy}</button></div>`;
}

/** Expands {{icon:name}}, {{ts:code}} and {{sh:code}} placeholders in page templates. */
function expand(html) {
	return html
		.replace(/\{\{icon:(\w+)\}\}/g, (_, name) => ICONS[name])
		.replace(/\{\{(ts|sh):([\s\S]*?)\}\}(?!\})/g, (_, lang, code) => highlight(code.replace(/^\n/, ''), lang));
}

// ---------- Docs ----------

const API_FILES = ['binary-search-tree', 'linked-list', 'stack', 'queue', 'priority-queue', 'set', 'map', 'hash-table'];

/** Inline JSDoc (with {@link X.y} and `code`) to HTML. */
function inlineDoc(marked, text) {
	return marked.parseInline(text.replace(/\{@link\s+([^}\s]+)\s*\}/g, '`$1`'));
}

function renderApi(marked) {
	let md = '## API reference\n\nGenerated from the type declarations that ship with the package.\n\n';
	const sections = [];
	for (const file of API_FILES) {
		const source = fs.readFileSync(path.join(root, 'dist', `${file}.d.ts`), 'utf8');
		for (const cls of parseDeclarations(source)) {
			if (cls.name.endsWith('Node')) continue;
			sections.push(cls);
		}
	}
	md += sections
		.map((cls) => `### ${cls.name} {#api-${cls.name.toLowerCase()}}\n\n<!-- api:${cls.name} -->`)
		.join('\n\n');

	let html = marked.parse(md);
	for (const cls of sections) {
		const members = cls.members
			.map((member) => {
				const tags = member.tags
					.map(({ name, text }) => {
						if (name === 'deprecated')
							return `<p class="api-tag"><span class="pill pill-warn">Deprecated</span> ${inlineDoc(marked, text)}</p>`;
						if (name === 'throws') {
							const [, type = '', rest = text] = /^\{([^}]+)\}\s*([\s\S]*)$/.exec(text) ?? [];
							return `<p class="api-tag"><span class="api-tag-name">Throws</span> <code>${escapeHtml(type)}</code> ${inlineDoc(marked, rest)}</p>`;
						}
						if (name === 'param') {
							const [, param = '', rest = ''] = /^(\w+)\s*([\s\S]*)$/.exec(text) ?? [];
							return `<p class="api-tag"><span class="api-tag-name">Parameter</span> <code>${escapeHtml(param)}</code> ${inlineDoc(marked, rest)}</p>`;
						}
						return '';
					})
					.join('');
				return `<div class="api-member"><pre class="api-signature"><code>${highlight(member.signature, 'typescript')}</code></pre>${
					member.doc
						? `<div class="api-doc">${marked.parse(member.doc.replace(/\{@link\s+([^}\s]+)\s*\}/g, '`$1`'))}</div>`
						: ''
				}${tags}</div>`;
			})
			.join('\n');
		const intro = `<pre class="api-class"><code>${highlight(cls.signature, 'typescript')}</code></pre><div class="api-doc">${marked.parse(
			cls.doc.replace(/\{@link\s+([^}\s]+)\s*\}/g, '`$1`'),
		)}</div>`;
		html = html.replace(`<!-- api:${cls.name} -->`, `${intro}<div class="api-members">${members}</div>`);
	}
	return html;
}

function renderDocs() {
	const slug = createSlugger();
	const toc = [];
	const marked = new Marked({ gfm: true });

	marked.use({
		renderer: {
			heading({ tokens, depth, text: rawText }) {
				const custom = /\s*\{#([\w-]+)\}\s*$/.exec(rawText);
				let html = this.parser.parseInline(tokens).replace(/\s*\{#[\w-]+\}\s*$/, '');
				const text = stripTags(html);
				const id = custom ? custom[1] : slug(text);
				if (depth === 2 || depth === 3) toc.push({ depth, id, html });
				const anchor =
					depth > 1 ? `<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a>` : '';
				return `<h${depth} id="${id}">${html}${anchor}</h${depth}>\n`;
			},
			code({ text, lang }) {
				return codeBlock(text, lang, lang === 'ts' ? 'TypeScript' : lang === 'bash' ? 'Shell' : lang) + '\n';
			},
		},
	});

	// The README header (title and badges) is for GitHub and npm; the site has its own header.
	const readme = fs
		.readFileSync(path.join(root, 'README.md'), 'utf8')
		.replace(/<!-- site:skip -->[\s\S]*?<!-- \/site:skip -->\n*/g, '')
		// Links to the changelog point at GitHub, where the file is rendered.
		.replace(/\]\(\.\/CHANGELOG\.md/g, `](${REPO}/blob/master/CHANGELOG.md`);
	const body = `<h1 id="icollections">Documentation</h1>\n${marked.parse(readme)}${renderApi(marked)}`
		.replace(/<table>/g, '<div class="table-scroll"><table>')
		.replace(/<\/table>/g, '</table></div>');

	let tocHtml = '<ol>';
	let open = false;
	for (const item of toc) {
		if (item.depth === 2) {
			if (open) tocHtml += '</ol></li>';
			tocHtml += `<li class="toc-h2"><a href="#${item.id}">${item.html}</a><ol>`;
			open = true;
		} else {
			tocHtml += `<li><a href="#${item.id}">${item.html}</a></li>`;
		}
	}
	if (open) tocHtml += '</ol></li>';
	tocHtml = (tocHtml + '</ol>').replace(/<ol><\/ol>/g, '');

	return `<div class="docs">
  <details class="docs-toc" open>
    <summary>On this page</summary>
    <nav aria-label="On this page">${tocHtml}</nav>
  </details>
  <article class="prose">${body}</article>
</div>`;
}

// ---------- Layout ----------

function layout({ file, page, title, description, body, scripts = [] }) {
	const url = new URL(file === 'index.html' ? '' : file, SITE_URL).href;
	const v = version();
	const nav = [
		['home', 'index.html', 'Home'],
		['docs', 'docs.html', 'Docs'],
		['playground', 'playground.html', 'Playground'],
	]
		.map(([id, href, label]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`)
		.join('');

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${url}" />
<meta name="theme-color" content="#0f766e" />
<link rel="icon" href="${FAVICON}" />
<script>
  try {
    const t = localStorage.getItem("icollections-theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch {}
</script>
<link rel="stylesheet" href="assets/styles.css" />
</head>
<body data-page="${page}">
<a class="visually-hidden" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      ${BRAND_MARK}
      <span class="brand-name">ICollections</span>
      ${v ? `<span class="brand-version">${escapeHtml(v)}</span>` : ''}
    </a>
    <nav class="site-nav" aria-label="Main">
      ${nav}
      <a class="nav-github" href="${REPO}" aria-label="GitHub repository">${ICONS.github.replace('<svg', '<svg width="16" height="16" style="vertical-align:-3px"')} <span>GitHub</span></a>
    </nav>
    <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle dark mode">${ICONS.theme}</button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <span>MIT licensed${v ? ` · ${escapeHtml(v)}` : ''}</span>
    <nav aria-label="Footer">
      <a href="docs.html">Docs</a>
      <a href="playground.html">Playground</a>
      <a href="${REPO}">GitHub</a>
      <a href="${NPM}">npm</a>
      <a href="${REPO}/releases">Releases</a>
    </nav>
  </div>
</footer>
<script type="module" src="assets/site.js"></script>
${scripts.map((s) => `<script type="module" src="${s}"></script>`).join('\n')}
</body>
</html>
`;
}

// ---------- Build ----------

async function build() {
	if (!fs.existsSync(path.join(root, 'dist', 'index.d.ts'))) {
		throw new Error('Run `npm run build` first: the API reference is generated from dist/*.d.ts.');
	}
	fs.rmSync(out, { recursive: true, force: true });
	fs.mkdirSync(path.join(out, 'assets'), { recursive: true });

	await esbuild.build({
		entryPoints: {
			site: path.join(here, 'src/site.ts'),
			home: path.join(here, 'src/home.ts'),
			playground: path.join(here, 'src/playground.ts'),
		},
		outdir: path.join(out, 'assets'),
		bundle: true,
		format: 'esm',
		splitting: true,
		minify: true,
		// The console output names collections by their class name.
		keepNames: true,
		sourcemap: process.argv.includes('--sourcemap'),
		target: 'es2022',
		legalComments: 'linked',
		logLevel: 'warning',
	});
	fs.copyFileSync(path.join(here, 'styles.css'), path.join(out, 'assets/styles.css'));

	const pages = [
		{
			file: 'index.html',
			page: 'home',
			title: 'ICollections: typed data structures for TypeScript',
			description:
				'Strictly typed, dependency-free data structures for TypeScript: binary search tree, linked list, stack, queue, priority queue, set, map and hash table. With an interactive playground.',
			body: expand(read('pages/index.html')),
			scripts: ['assets/home.js'],
		},
		{
			file: 'docs.html',
			page: 'docs',
			title: 'Docs · ICollections',
			description: 'Install ICollections and learn every collection, with examples and a full API reference.',
			body: renderDocs(),
		},
		{
			file: 'playground.html',
			page: 'playground',
			title: 'Playground · ICollections',
			description:
				'Watch data structures work: insert into a binary search tree, walk a linked list, hash keys into buckets, or write TypeScript against the library in your browser.',
			body: expand(read('pages/playground.html')),
			scripts: ['assets/playground.js'],
		},
	];

	for (const page of pages) fs.writeFileSync(path.join(out, page.file), layout(page));
	fs.writeFileSync(path.join(out, '.nojekyll'), '');

	const files = fs.readdirSync(path.join(out, 'assets')).filter((f) => f.endsWith('.js'));
	const total = files.reduce((sum, f) => sum + fs.statSync(path.join(out, 'assets', f)).size, 0);
	console.log(`Built site/dist: ${files.length} scripts, ${(total / 1024).toFixed(0)} KB`);
}

function serve(port = 4173) {
	const types = {
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.map': 'application/json',
		'.txt': 'text/plain',
	};
	http.createServer((req, res) => {
		const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		const file = path.join(out, url === '/' ? 'index.html' : url);
		if (!file.startsWith(out) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
			res.writeHead(404).end('Not found');
			return;
		}
		res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
		fs.createReadStream(file).pipe(res);
	}).listen(port, () => console.log(`Serving http://localhost:${port}`));
}

await build();
if (process.argv.includes('--serve')) serve();
