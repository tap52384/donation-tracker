/* eslint-env jest, es6 */

// requires the necessary code
require( './app/common.client.js.html' );

test( 'verifies jest tests are working', () => {
    expect( true ).toBe( true );
} );

test( 'sees if window is available (2nd attempt)...', () => {
    expect( window !== undefined ).toBe( true );
} );

test( 'sees if window.code is available...', () => {
    expect( window.code !== undefined ).toBe( true );
} );

test( 'isNullOrEmpty is a function', () => {
    expect( typeof window.code.isNullOrEmpty === 'function' ).toBe( true );
} );

test( 'isNullOrEmptySpace works correctly', () => {
    expect( window.code.isNullOrEmptySpace( '' ) ).toBe( true );
    expect( window.code.isNullOrEmptySpace( undefined ) ).toBe( true );
    expect( window.code.isNullOrEmptySpace( ' ' ) ).toBe( true );
    expect( window.code.isNullOrEmptySpace( '  ' ) ).toBe( true );
    expect( window.code.isNullOrEmptySpace( null ) ).toBe( true );
    expect( window.code.isNullOrEmptySpace( 'donation ' ) ).toBe( false );
} );
