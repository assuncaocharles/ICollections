/**
 * Orders two values. Returns a negative number if `a` comes before `b`,
 * a positive number if `a` comes after `b`, and `0` if they are equivalent.
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Compares values with the `<` and `>` operators. Works for numbers, strings, bigints and dates.
 * Supply a custom {@link Comparator} for anything else.
 */
export function defaultCompare<T>(a: T, b: T): number {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}
