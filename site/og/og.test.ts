import fs from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the link preview image small enough for every app to show it', () => {
	// WhatsApp, among others, drops preview images over about 300 KB.
	const { size } = fs.statSync(new URL('../public/og.jpg', import.meta.url));
	expect(size).toBeLessThan(300 * 1024);
});
