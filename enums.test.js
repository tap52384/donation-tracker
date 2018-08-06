/* eslint-env jest, es6, node */

var common = require( './app/common.server' );
var enums = require( './app/enums' );

// establish a custom matcher that checks whether a variable is null or empty
// or undefined
expect.extend( {
  isNullOrEmpty( received ) {
    const pass = ( received === undefined || received === '' ||
    received === null || typeof received.trim === 'function' &&
    received.trim().replace( / /g, '' ) === '' );
    if ( pass ) {
      return {
        message: () =>
          `expected ${received} is null, undefined, or empty space`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} is NOT null, undefined, or ` +
        'empty space',
        pass: false
      };
    }
  }
} );

test( 'verifies jest tests are working', () => {
    expect( true ).toBe( true );
} );

test( 'is module valid', () => {
    expect( module ).not.toBeUndefined();
} );
