/**
 * WordPress dependencies
 */
import { useRef, useCallback, useLayoutEffect } from '@wordpress/element';

/** @typedef {import('@wordpress/element').RefObject} RefObject */
/** @typedef {import('@wordpress/element').RefCallback} RefCallback */

function assignRef( ref, value ) {
	if ( typeof ref === 'function' ) {
		ref( value );
	} else if ( ref && ref.hasOwnProperty( 'current' ) ) {
		ref.current = value;
	}
}

/**
 * Merges refs into one ref callback. Ensures the merged ref callbacks are only
 * called when it changes (as a result of a `useCallback` dependency update) or
 * when the ref value changes. If you don't wish a ref callback to be called on
 * every render, wrap it with `useCallback( ref, [] )`.
 * Dependencies can be added, but when a dependency changes, the old ref
 * callback will be called with `null` and the new ref callback will be called
 * with the same node.
 *
 * @param {Array<RefObject|RefCallback>} refs The refs to be merged.
 *
 * @return {RefCallback} The merged ref callback.
 */
export default function useMergeRefs( refs ) {
	const element = useRef( null );
	const didElementChange = useRef( false );
	const previousRefs = useRef();
	const currentRefs = useRef( refs );

	// Update on render before the ref callback is called, so the ref callback
	// always has access to the current refs.
	currentRefs.current = refs;

	// If any of the refs change, call the previous ref with `null` and the new
	// ref with the node, except when the element changes in the same cycle, in
	// which case the ref callbacks will already have been called.
	useLayoutEffect( () => {
		if ( didElementChange.current === false ) {
			if ( previousRefs.current ) {
				for ( const previousRef of previousRefs.current ) {
					if ( ! refs.includes( previousRef ) ) {
						assignRef( previousRef, null );
					}
				}
			}

			for ( const ref of refs ) {
				if (
					! previousRefs.current ||
					! previousRefs.current.includes( ref )
				) {
					assignRef( ref, element.current );
				}
			}
		}

		previousRefs.current = refs;
		didElementChange.current = false;
	}, [ refs.length, ...refs ] );

	// There should be no dependencies so that `callback` is only called when
	// the node changes.
	return useCallback( ( value ) => {
		// Update the element so it can be used when calling ref callbacks on a
		// dependency change.
		element.current = value;
		didElementChange.current = true;

		// When an element changes, the current ref callback should be called
		// with the new element and the previous one with `null`.
		const refsToUpdate = value ? currentRefs.current : previousRefs.current;

		// Update the latest refs.
		for ( const ref of refsToUpdate ) {
			assignRef( ref, value );
		}
	}, [] );
}
