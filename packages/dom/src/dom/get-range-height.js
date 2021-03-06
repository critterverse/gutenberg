/**
 * Gets the height of the range without ignoring zero width rectangles, which
 * some browsers ignore when creating a union.
 *
 * @param {Range} range The range to check.
 */
export default function getRangeHeight( range ) {
	const rects = Array.from( range.getClientRects() );

	if ( ! rects.length ) {
		return;
	}

	const highestTop = Math.min( ...rects.map( ( { top } ) => top ) );
	const lowestBottom = Math.max( ...rects.map( ( { bottom } ) => bottom ) );

	return lowestBottom - highestTop;
}
