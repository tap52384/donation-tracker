/* eslint-env jest, es6 */

const code = require( './app/common.server' );

test( 'verifies jest tests are working', () => {
    expect( true ).toBe( true );
} );

test( 'isNullOrEmpty is a function', () => {
    expect( typeof code.isNullOrEmpty === 'function' ).toBe( true );
} );
