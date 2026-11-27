/**
 * SameValueZero equality, the algorithm used by `Array.prototype.includes`, `Map` and `Set`:
 * like `===`, but `NaN` equals `NaN`.
 *
 * @internal
 */
export function sameValueZero(a: unknown, b: unknown): boolean {
	return a === b || (a !== a && b !== b);
}
