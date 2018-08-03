/* eslint-env jest, es6, node */

// creates an empty DOM to be used to create global window and document objects
const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
var dom = new JSDOM();

// global is a node.js global object
if ( global !== undefined ) {
  global.window = dom.window;
  global.document = dom.window.document;
}


// requires the necessary code
require( './app/common.client.js.html' );

console.log( 'location: ' + window.location.href );

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

test( 'collect() function exists', () => {
    expect( typeof window.code.collect ).toMatch( 'function' );
} );
