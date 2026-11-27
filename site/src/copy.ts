const CHECK =
	'<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg>';

/** Copies `text` and briefly shows a check mark on `button`. */
export async function copyWithFeedback(button: HTMLElement, text: string): Promise<void> {
	const original = button.innerHTML;
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		return;
	}
	button.innerHTML = CHECK;
	button.classList.add('copied');
	button.setAttribute('aria-label', 'Copied');
	setTimeout(() => {
		button.innerHTML = original;
		button.classList.remove('copied');
		button.setAttribute('aria-label', 'Copy');
	}, 1500);
}
